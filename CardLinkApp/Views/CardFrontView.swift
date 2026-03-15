import SwiftUI

/// 表面: 英語コンテンツ
struct CardFrontView: View {
    let profile: CardProfile

    var body: some View {
        CardLayout(
            name: profile.name,
            title: profile.title,
            bio: profile.bio,
            avatarURL: profile.avatarURL,
            socialLinks: profile.socialLinks,
            styles: profile.styles
        )
    }
}

/// 裏面: デバイス言語に翻訳されたコンテンツ
struct CardBackView: View {
    let profile: CardProfile

    var body: some View {
        CardLayout(
            name: profile.nameTranslated ?? profile.name,
            title: profile.titleTranslated ?? profile.title,
            bio: profile.bioTranslated ?? profile.bio,
            avatarURL: profile.avatarURL,
            socialLinks: profile.socialLinks,
            styles: profile.styles
        )
    }
}

/// 共通カードレイアウト（表裏で完全に同じデザイン）
struct CardLayout: View {
    let name: String
    let title: String
    let bio: String
    let avatarURL: String
    let socialLinks: [SocialLinkItem]
    let styles: CardStyles

    var body: some View {
        let bgColor = Color(hex: styles.bgColor)
        let textColor = Color(hex: styles.textColor)
        let accentColor = Color(hex: styles.accentColor)

        ZStack {
            if let parsed = styles.parseGradient() {
                LinearGradient(
                    colors: parsed.colors,
                    startPoint: gradientStartPoint(angle: parsed.angle),
                    endPoint: gradientEndPoint(angle: parsed.angle)
                )
            } else {
                bgColor
            }

            // Top metallic edge
            VStack {
                LinearGradient(
                    colors: [.clear, textColor.opacity(0.04), .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(height: 0.5)
                Spacer()
            }

            VStack(alignment: .leading, spacing: 0) {
                // Avatar + Name + Title
                HStack(spacing: 12) {
                    if !avatarURL.isEmpty {
                        AsyncImage(url: URL(string: avatarURL)) { image in
                            image.resizable().scaledToFill()
                        } placeholder: {
                            Circle()
                                .fill(accentColor.opacity(0.1))
                                .overlay(
                                    Text(String(name.prefix(1)))
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(accentColor.opacity(0.6))
                                )
                        }
                        .frame(width: 36, height: 36)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(textColor.opacity(0.08), lineWidth: 1))
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(name)
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(textColor)
                            .tracking(0.5)

                        if !title.isEmpty {
                            Text(title.uppercased())
                                .font(.system(size: 8, weight: .medium))
                                .foregroundColor(textColor.opacity(0.35))
                                .tracking(2)
                        }
                    }
                }

                Spacer()

                // Bio
                if !bio.isEmpty {
                    Text(bio)
                        .font(.system(size: 11))
                        .foregroundColor(textColor.opacity(0.4))
                        .lineLimit(2)
                        .lineSpacing(2)
                        .padding(.bottom, 8)
                }

                // Social icons
                HStack(spacing: 10) {
                    ForEach(socialLinks.prefix(6)) { link in
                        if let platform = SocialPlatform(rawValue: link.platform) {
                            Image(systemName: platform.sfSymbol)
                                .font(.system(size: 12))
                                .foregroundColor(accentColor.opacity(0.7))
                        }
                    }
                }
            }
            .padding(20)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)

            // Bottom metallic edge
            VStack {
                Spacer()
                LinearGradient(
                    colors: [.clear, textColor.opacity(0.02), .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(height: 0.5)
            }
        }
    }

    /// Convert CSS gradient angle to SwiftUI start point
    private func gradientStartPoint(angle: Double) -> UnitPoint {
        let rad = (angle - 90) * .pi / 180
        let x = 0.5 + cos(rad + .pi) * 0.5
        let y = 0.5 + sin(rad + .pi) * 0.5
        return UnitPoint(x: x, y: y)
    }

    /// Convert CSS gradient angle to SwiftUI end point
    private func gradientEndPoint(angle: Double) -> UnitPoint {
        let rad = (angle - 90) * .pi / 180
        let x = 0.5 + cos(rad) * 0.5
        let y = 0.5 + sin(rad) * 0.5
        return UnitPoint(x: x, y: y)
    }
}
