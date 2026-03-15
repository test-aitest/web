import WidgetKit
import SwiftUI

struct CardLinkProvider: TimelineProvider {
    func placeholder(in context: Context) -> CardLinkEntry {
        CardLinkEntry(date: .now, profile: .empty)
    }

    func getSnapshot(in context: Context, completion: @escaping (CardLinkEntry) -> Void) {
        let entry = CardLinkEntry(date: .now, profile: loadProfile())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CardLinkEntry>) -> Void) {
        let entry = CardLinkEntry(date: .now, profile: loadProfile())
        let timeline = Timeline(entries: [entry], policy: .after(.now.addingTimeInterval(3600)))
        completion(timeline)
    }

    private func loadProfile() -> CardProfile {
        let defaults = UserDefaults(suiteName: "group.com.cardlink.app") ?? .standard
        guard let data = defaults.data(forKey: "card_profile"),
              let profile = try? JSONDecoder().decode(CardProfile.self, from: data) else {
            return .empty
        }
        return profile
    }
}

struct CardLinkEntry: TimelineEntry {
    let date: Date
    let profile: CardProfile
}

// MARK: - Lock Screen Widgets

struct CardLinkAccessoryCircular: View {
    let profile: CardProfile

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            Image(systemName: "person.crop.rectangle")
                .font(.system(size: 20))
        }
        .widgetURL(URL(string: "cardlink://show-card"))
    }
}

struct CardLinkAccessoryRectangular: View {
    let profile: CardProfile

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(profile.name)
                .font(.system(size: 14, weight: .bold))
                .lineLimit(1)

            if !profile.title.isEmpty {
                Text(profile.title)
                    .font(.system(size: 11))
                    .opacity(0.7)
                    .lineLimit(1)
            }

            Text("CardLink")
                .font(.system(size: 9))
                .opacity(0.4)
        }
        .widgetURL(URL(string: "cardlink://show-card"))
    }
}

// MARK: - Home Screen Widgets

struct CardLinkSmallWidget: View {
    let profile: CardProfile

    var body: some View {
        ZStack {
            Color(hex: profile.styles.bgColor)

            VStack(spacing: 8) {
                if let qrImage = StyledQRGenerator.generate(
                    from: profile.profileURL,
                    size: 100,
                    foregroundColor: UIColor(Color(hex: profile.styles.textColor)),
                    backgroundColor: UIColor(Color(hex: profile.styles.bgColor))
                ) {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 80, height: 80)
                }

                Text(profile.name)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(Color(hex: profile.styles.textColor))
                    .lineLimit(1)
            }
            .padding(8)
        }
        .widgetURL(URL(string: "cardlink://show-card"))
    }
}

struct CardLinkMediumWidget: View {
    let profile: CardProfile

    var body: some View {
        ZStack {
            Color(hex: profile.styles.bgColor)

            HStack(spacing: 12) {
                // QR
                if let qrImage = StyledQRGenerator.generate(
                    from: profile.profileURL,
                    size: 120,
                    foregroundColor: UIColor(Color(hex: profile.styles.textColor)),
                    backgroundColor: UIColor(Color(hex: profile.styles.bgColor))
                ) {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 100, height: 100)
                }

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(profile.name)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(hex: profile.styles.textColor))

                    if !profile.title.isEmpty {
                        Text(profile.title)
                            .font(.system(size: 12))
                            .foregroundColor(Color(hex: profile.styles.textColor).opacity(0.7))
                    }

                    Spacer()

                    HStack(spacing: 6) {
                        ForEach(profile.socialLinks.prefix(4)) { link in
                            if let platform = SocialPlatform(rawValue: link.platform) {
                                Image(systemName: platform.sfSymbol)
                                    .font(.system(size: 12))
                                    .foregroundColor(Color(hex: profile.styles.accentColor))
                            }
                        }
                    }
                }

                Spacer()
            }
            .padding(12)
        }
        .widgetURL(URL(string: "cardlink://show-card"))
    }
}

// MARK: - Widget Configuration

struct CardLinkWidget: Widget {
    let kind: String = "CardLinkWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CardLinkProvider()) { entry in
            CardLinkWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    Color(hex: entry.profile.styles.bgColor)
                }
        }
        .configurationDisplayName("CardLink")
        .description("デジタル名刺をホーム画面に表示")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
    }
}

struct CardLinkWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: CardLinkEntry

    var body: some View {
        switch family {
        case .systemSmall:
            CardLinkSmallWidget(profile: entry.profile)
        case .systemMedium:
            CardLinkMediumWidget(profile: entry.profile)
        case .accessoryCircular:
            CardLinkAccessoryCircular(profile: entry.profile)
        case .accessoryRectangular:
            CardLinkAccessoryRectangular(profile: entry.profile)
        default:
            CardLinkSmallWidget(profile: entry.profile)
        }
    }
}
