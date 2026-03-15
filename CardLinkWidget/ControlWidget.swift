import WidgetKit
import SwiftUI
import AppIntents

// Control Center Widget - iOS 26
struct CardLinkControlWidget: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "com.cardlink.control") {
            ControlWidgetButton(action: OpenCardLinkIntent()) {
                Label("CardLink", systemImage: "person.crop.rectangle")
            }
        }
        .displayName("CardLink")
        .description("カード画面を開く")
    }
}

struct OpenCardLinkIntent: AppIntent {
    static let title: LocalizedStringResource = "CardLinkを開く"
    static let openAppWhenRun: Bool = true

    func perform() async throws -> some IntentResult {
        return .result()
    }
}
