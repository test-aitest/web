import Foundation
import SwiftUI

struct CardProfile: Codable {
    var name: String
    var title: String
    var bio: String
    var avatarURL: String
    var profileURL: String
    var socialLinks: [SocialLinkItem]
    var styles: CardStyles

    // Translated fields (cached, populated by Translation framework)
    var nameTranslated: String?
    var titleTranslated: String?
    var bioTranslated: String?
    var translatedLanguage: String? // e.g. "ja"

    static let empty = CardProfile(
        name: "Your Name",
        title: "Software Engineer",
        bio: "",
        avatarURL: "",
        profileURL: "http://localhost:3002/profile",
        socialLinks: [],
        styles: .default
    )

    /// Returns true if translated content is available
    var hasTranslation: Bool {
        nameTranslated != nil || titleTranslated != nil || bioTranslated != nil
    }
}

struct SocialLinkItem: Codable, Identifiable {
    var id: String
    var platform: String
    var url: String
    var label: String

    init(id: String = UUID().uuidString, platform: String, url: String, label: String = "") {
        self.id = id
        self.platform = platform
        self.url = url
        self.label = label
    }
}

struct CardStyles: Codable {
    var bgColor: String
    var textColor: String
    var accentColor: String
    var gradient: String?

    static let `default` = CardStyles(
        bgColor: "#1a1a1a",
        textColor: "#ffffff",
        accentColor: "#3b82f6",
        gradient: nil
    )

    /// Parse a CSS linear-gradient string into angle and color stops
    func parseGradient() -> (angle: Double, colors: [Color])? {
        guard let gradient = gradient, !gradient.isEmpty else { return nil }

        // Match: linear-gradient(135deg, #hex 0%, #hex 50%, #hex 100%)
        let pattern = #"linear-gradient\((\d+(?:\.\d+)?)deg,\s*(.+)\)"#
        guard let regex = try? NSRegularExpression(pattern: pattern),
              let match = regex.firstMatch(in: gradient, range: NSRange(gradient.startIndex..., in: gradient)) else {
            return nil
        }

        let angleStr = String(gradient[Range(match.range(at: 1), in: gradient)!])
        let stopsStr = String(gradient[Range(match.range(at: 2), in: gradient)!])

        guard let angle = Double(angleStr) else { return nil }

        // Extract hex colors from stops
        let colorPattern = #"(#[0-9a-fA-F]{6})"#
        guard let colorRegex = try? NSRegularExpression(pattern: colorPattern) else { return nil }
        let colorMatches = colorRegex.matches(in: stopsStr, range: NSRange(stopsStr.startIndex..., in: stopsStr))
        let colors = colorMatches.compactMap { m -> Color? in
            let hex = String(stopsStr[Range(m.range(at: 1), in: stopsStr)!])
            return Color(hex: hex)
        }

        guard !colors.isEmpty else { return nil }
        return (angle, colors)
    }
}

// Platform icon mapping for SF Symbols
enum SocialPlatform: String, CaseIterable {
    case linkedin, x, github, blog, instagram, facebook
    case qiita, zenn, youtube, email, website, note, tiktok, discord

    var label: String {
        switch self {
        case .linkedin: "LinkedIn"
        case .x: "X (Twitter)"
        case .github: "GitHub"
        case .blog: "Blog"
        case .instagram: "Instagram"
        case .facebook: "Facebook"
        case .qiita: "Qiita"
        case .zenn: "Zenn"
        case .youtube: "YouTube"
        case .email: "Email"
        case .website: "Website"
        case .note: "note"
        case .tiktok: "TikTok"
        case .discord: "Discord"
        }
    }

    var sfSymbol: String {
        switch self {
        case .linkedin: "link.circle.fill"
        case .x: "xmark.circle.fill"
        case .github: "chevron.left.forwardslash.chevron.right"
        case .blog: "text.book.closed.fill"
        case .instagram: "camera.circle.fill"
        case .facebook: "person.2.circle.fill"
        case .qiita: "doc.text.fill"
        case .zenn: "book.circle.fill"
        case .youtube: "play.circle.fill"
        case .email: "envelope.circle.fill"
        case .website: "globe"
        case .note: "note.text"
        case .tiktok: "music.note.list"
        case .discord: "bubble.left.circle.fill"
        }
    }
}
