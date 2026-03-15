import SwiftUI

@main
struct CardLinkApp: App {
    @State private var store = ProfileStore()

    var body: some Scene {
        WindowGroup {
            CardContainerView(store: store)
                .onOpenURL { url in
                    // Handle cardlink://show-card deep link
                    if url.scheme == "cardlink" && url.host == "show-card" {
                        // Already showing card - no action needed
                    }
                }
        }
    }
}
