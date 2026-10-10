# Quiz „Chłopcy z Placu Broni”

Mobilny quiz dla uczniów. Bank zawiera 100 pytań (po 20 w pięciu sekcjach); jedna sesja losuje 10 pytań, po dwa z każdej sekcji. Uczeń podaje wyłącznie pseudonim.

## Strona

Quiz jest publikowany przez GitHub Pages:

https://sochagrzegorz.github.io/chlopcy-z-placu-broni-quiz/

Repozytorium: https://github.com/sochagrzegorz/chlopcy-z-placu-broni-quiz

Po zmianach w index.html GitHub Pages automatycznie przebuduje stronę.

## Ocena AI w sekcji IV — konfiguracja wymagana

Plik worker.js zawiera backend API oparty o OpenAI Responses API. GitHub Pages obsługuje statyczne pliki i nie może bezpiecznie przechowywać sekretu API. Dlatego ocena AI pozostaje wyłączona do czasu wdrożenia backendu i ustawienia jego adresu w index.html.

1. Utwórz konto Cloudflare, otwórz Workers & Pages i utwórz nowego Workera.
2. Wklej zawartość worker.js do edytora Workera i opublikuj go.
3. W ustawieniach Workera otwórz Settings → Variables and Secrets, dodaj sekret o nazwie OPENAI_API_KEY i wprowadź tam klucz OpenAI. Nie wklejaj klucza do index.html, repozytorium ani czatu.
4. Skopiuj adres Workera, zakończony ścieżką /grade, np. https://nazwa-workera.twoje-konto.workers.dev/grade.
5. W index.html ustaw AI_API_URL na ten adres i zapisz zmianę na GitHubie. Przycisk Oceń odpowiedzi AI w sekcji IV będzie wtedy aktywny.

Klucz OpenAI jest osobnym sekretem API. Skorzystaj z [oficjalnego przewodnika OpenAI API](https://developers.openai.com/api/docs/quickstart), by go utworzyć. Nie udostępniaj klucza uczniom. API przesyła do modelu wyłącznie dwie krótkie odpowiedzi i treść pytań — pseudonim nie jest wysyłany. Ocena AI (0–4 pkt) jest propozycją do sprawdzenia przez nauczyciela.

Worker ogranicza liczbę żądań na adres IP w obrębie aktywnego procesu. To podstawowa ochrona przed nadużyciami, a nie pełny system limitowania. Ustaw limit wydatków w panelu API i obserwuj użycie.

## Funkcje

- pięć sekcji: wybór odpowiedzi, prawda/fałsz, dopasowywanie, krótkie odpowiedzi, dłuższa wypowiedź;
- 10 losowych pytań na sesję — po dwa z każdej sekcji;
- punktowanie pytań z sekcji I–III;
- opcjonalna ocena AI dla krótkich odpowiedzi w sekcji IV;
- odpowiedź z sekcji V nadal ocenia nauczyciel;
- pseudonim zamiast imienia, nazwiska i klasy;
- przycisk rozpoczęcia nowej sesji;
- układ dostosowany do telefonu;
- drukowanie lub zapis do PDF z przeglądarki.

Treść banku pytań przygotowano na podstawie lektury; pytania i odpowiedzi warto zweryfikować pod kątem wydania omawianego w klasie.

