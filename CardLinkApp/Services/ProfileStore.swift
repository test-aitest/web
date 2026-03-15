import Foundation
import SwiftUI
import Translation

@MainActor
@Observable
class ProfileStore {
    private let defaults = UserDefaults(suiteName: "group.com.cardlink.app") ?? .standard
    private let profileKey = "card_profile"

    var profile: CardProfile {
        didSet { save() }
    }

    var isTranslating = false

    init() {
        if let data = defaults.data(forKey: profileKey),
           let decoded = try? JSONDecoder().decode(CardProfile.self, from: data) {
            self.profile = decoded
        } else {
            self.profile = .empty
        }
    }

    private func save() {
        if let data = try? JSONEncoder().encode(profile) {
            defaults.set(data, forKey: profileKey)
        }
    }

    func updateProfileURL(_ url: String) {
        profile.profileURL = url
    }

    // MARK: - Web Sync

    func fetchFromWeb() async {
        guard let url = URL(string: profile.profileURL.replacingOccurrences(of: "/profile", with: "/api/profile")) else { return }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let webProfile = try JSONDecoder().decode(WebProfile.self, from: data)

            profile.name = webProfile.name
            profile.title = webProfile.title ?? ""
            profile.bio = webProfile.bio ?? ""
            profile.avatarURL = webProfile.avatar_url ?? ""
            if let styles = webProfile.custom_styles {
                profile.styles = CardStyles(
                    bgColor: styles.bg_color,
                    textColor: styles.text_color,
                    accentColor: styles.accent_color,
                    gradient: styles.gradient
                )
            }

            let baseURL = profile.profileURL.replacingOccurrences(of: "/profile", with: "")
            if let linksURL = URL(string: "\(baseURL)/api/links?profile_id=\(webProfile.id)") {
                let (linksData, _) = try await URLSession.shared.data(from: linksURL)
                let webLinks = try JSONDecoder().decode([WebSocialLink].self, from: linksData)

                profile.socialLinks = webLinks
                    .filter { $0.is_visible }
                    .sorted { $0.sort_order < $1.sort_order }
                    .map { SocialLinkItem(id: $0.id, platform: $0.platform, url: $0.url, label: $0.label ?? "") }
            }
        } catch {
            print("Failed to fetch profile: \(error)")
        }
    }

    // MARK: - Translation

    /// Device language code (e.g. "ja", "zh-Hans", "ko")
    var deviceLanguage: String {
        Locale.current.language.languageCode?.identifier ?? "en"
    }

    /// Whether device language differs from English (translation needed)
    var needsTranslation: Bool {
        deviceLanguage != "en"
    }

    /// Translate profile content using Apple Translation framework
    nonisolated func translateProfile(session: TranslationSession) async {
        let snapshot = await MainActor.run { (profile.name, profile.title, profile.bio, deviceLanguage, needsTranslation, profile.translatedLanguage == deviceLanguage && profile.hasTranslation) }
        let (name, title, bio, lang, needs, alreadyDone) = snapshot

        guard needs else { return }
        guard !alreadyDone else { return }

        await MainActor.run { isTranslating = true }

        do {
            var requests: [TranslationSession.Request] = []

            if !name.isEmpty {
                requests.append(TranslationSession.Request(sourceText: name))
            }
            if !title.isEmpty {
                requests.append(TranslationSession.Request(sourceText: title))
            }
            if !bio.isEmpty {
                requests.append(TranslationSession.Request(sourceText: bio))
            }

            let responses = try await session.translations(from: requests)

            var nameT: String?
            var titleT: String?
            var bioT: String?
            var idx = 0
            if !name.isEmpty && idx < responses.count {
                nameT = responses[idx].targetText
                idx += 1
            }
            if !title.isEmpty && idx < responses.count {
                titleT = responses[idx].targetText
                idx += 1
            }
            if !bio.isEmpty && idx < responses.count {
                bioT = responses[idx].targetText
                idx += 1
            }

            await MainActor.run {
                profile.nameTranslated = nameT
                profile.titleTranslated = titleT
                profile.bioTranslated = bioT
                profile.translatedLanguage = lang
            }
        } catch {
            print("Translation failed: \(error)")
        }

        await MainActor.run { isTranslating = false }
    }
}

// MARK: - Web API Types

private struct WebProfile: Codable, Sendable {
    let id: String
    let name: String
    let title: String?
    let bio: String?
    let avatar_url: String?
    let custom_styles: WebStyles?
}

private struct WebStyles: Codable, Sendable {
    let bg_color: String
    let text_color: String
    let accent_color: String
    let gradient: String?
}

private struct WebSocialLink: Codable, Sendable {
    let id: String
    let platform: String
    let url: String
    let label: String?
    let sort_order: Int
    let is_visible: Bool
}
