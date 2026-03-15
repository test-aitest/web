import SwiftUI
import Translation

struct CardContainerView: View {
    @State var store: ProfileStore
    @State private var isFlipped = false
    @State private var showQRExpanded = false
    @State private var showSettings = false
    @State private var translationConfig: TranslationSession.Configuration?

    var body: some View {
        let styles = store.profile.styles
        let textColor = Color(hex: styles.textColor)

        GeometryReader { geo in
            let isLandscape = geo.size.width > geo.size.height
            // Card sizing: landscape = fill most of the screen, portrait = fill width
            let cardWidth: CGFloat = isLandscape
                ? min(geo.size.width * 0.85, (geo.size.height - 40) * 1.75)
                : geo.size.width - 40
            let cardHeight = cardWidth / 1.75

            ZStack {
                Color.black.ignoresSafeArea()

                if isLandscape {
                    // Landscape layout: card large, small action buttons overlaid
                    ZStack {
                        cardView
                            .frame(width: cardWidth, height: cardHeight)
                            .onTapGesture { flipCard() }

                        // Overlay buttons top-right
                        VStack(spacing: 16) {
                            Button { showSettings = true } label: {
                                Image(systemName: "gearshape")
                                    .font(.system(size: 13))
                                    .foregroundColor(textColor.opacity(0.2))
                            }

                            ShareLink(item: URL(string: store.profile.profileURL)!) {
                                Image(systemName: "square.and.arrow.up")
                                    .font(.system(size: 13))
                                    .foregroundColor(textColor.opacity(0.2))
                            }

                            Button { showQRExpanded = true } label: {
                                Image(systemName: "qrcode")
                                    .font(.system(size: 13))
                                    .foregroundColor(textColor.opacity(0.2))
                            }
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                        .padding(.top, 8)
                        .padding(.trailing, 12)
                    }
                } else {
                    // Portrait layout: card in center, buttons at bottom
                    VStack(spacing: 0) {
                        Spacer()

                        cardView
                            .frame(width: cardWidth, height: cardHeight)
                            .onTapGesture { flipCard() }

                        // Hint
                        Text(isFlipped ? "表面を見る" : "詳細を見る")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(textColor.opacity(0.15))
                            .tracking(2)
                            .textCase(.uppercase)
                            .padding(.top, 16)

                        Spacer()

                        // Bottom action bar
                        HStack(spacing: 32) {
                            ShareLink(item: URL(string: store.profile.profileURL)!) {
                                VStack(spacing: 4) {
                                    Image(systemName: "square.and.arrow.up")
                                        .font(.system(size: 16))
                                    Text("共有")
                                        .font(.system(size: 9))
                                }
                                .foregroundColor(textColor.opacity(0.3))
                            }

                            Button { showQRExpanded = true } label: {
                                VStack(spacing: 4) {
                                    Image(systemName: "qrcode")
                                        .font(.system(size: 16))
                                    Text("QR")
                                        .font(.system(size: 9))
                                }
                                .foregroundColor(textColor.opacity(0.3))
                            }
                        }
                        .padding(.bottom, 40)
                    }
                    .frame(maxWidth: .infinity)
                    .overlay(alignment: .topTrailing) {
                        Button { showSettings = true } label: {
                            Image(systemName: "gearshape")
                                .font(.system(size: 14))
                                .foregroundColor(textColor.opacity(0.2))
                                .padding(12)
                        }
                        .padding(.top, 4)
                        .padding(.trailing, 8)
                    }
                }
            }
        }
        .sheet(isPresented: $showSettings) {
            SettingsView(store: store)
        }
        .sheet(isPresented: $showQRExpanded) {
            QRExpandedView(profile: store.profile)
        }
        .task {
            await store.fetchFromWeb()
            // Trigger translation after data loads
            if store.needsTranslation {
                translationConfig = TranslationSession.Configuration(
                    source: Locale.Language(identifier: "en"),
                    target: Locale.Language(identifier: store.deviceLanguage)
                )
            }
        }
        .translationTask(translationConfig) { @Sendable session in
            await store.translateProfile(session: session)
        }
        .preferredColorScheme(.dark)
    }

    private func flipCard() {
        withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
            isFlipped.toggle()
        }
    }

    private var cardView: some View {
        ZStack {
            CardFrontView(profile: store.profile)
                .opacity(isFlipped ? 0 : 1)
                .rotation3DEffect(
                    .degrees(isFlipped ? 180 : 0),
                    axis: (x: 0, y: 1, z: 0)
                )

            CardBackView(profile: store.profile)
                .opacity(isFlipped ? 1 : 0)
                .rotation3DEffect(
                    .degrees(isFlipped ? 0 : -180),
                    axis: (x: 0, y: 1, z: 0)
                )
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.white.opacity(0.04), lineWidth: 0.5)
        )
        .shadow(color: .black.opacity(0.5), radius: 30, y: 15)
    }
}
