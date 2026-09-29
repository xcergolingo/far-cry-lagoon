# GoLingo SwiftUI → Lagoon integration

Load the public game in WKWebView, register a script message handler named `golingo`, then call `window.GoLingoGame.importWords(payload)`.

## Payload
```json
{
  "primaryLanguage": "en",
  "learningLanguage": "es",
  "words": [
    {
      "id": "word-1",
      "word": "barco",
      "translation": "boat",
      "sentence": "El barco está en el agua.",
      "sentenceTranslation": "The boat is in the water."
    }
  ]
}
```

Language codes may be short (`en`, `es`, `ja`, `fr`, etc.) or full locale codes.

## Swift call
```swift
webView.callAsyncJavaScript(
    "return await window.GoLingoGame.importWords(payload)",
    arguments: ["payload": payloadDictionary],
    in: nil,
    in: .page
)
```

## Messages from the game
Register:
```swift
webView.configuration.userContentController.add(handler, name: "golingo")
```

The game posts dictionaries with these event types:
- `ready`
- `wordsImported`
- `progressChanged`
- `wordAddedToBasket`
- `error`

`wordAddedToBasket` includes the original word id, learning word, translation, practice count, and current snapshot.

## JavaScript API
- `GoLingoGame.importWords(payload)`
- `GoLingoGame.snapshot()`
- `GoLingoGame.reviewWords()`
- `GoLingoGame.openBasket()`
- `GoLingoGame.openWords()`
- `GoLingoGame.resetProgress()`

Standalone paste mode continues to work when the game is opened outside GoLingo.
