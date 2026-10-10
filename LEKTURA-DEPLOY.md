# Quiz lekturowy — wdrożenie i utrzymanie

Strona ucznia: https://sochagrzegorz.github.io/chlopcy-z-placu-broni-quiz/lektura/

## Pliki i publikacja
- `lektura/index.html` zawiera cały interfejs, style, rysunek SVG, 100 pytań oraz 24 ciekawostki. GitHub Pages publikuje go z gałęzi main.
- `worker.js` należy osobno wdrożyć w istniejącym Cloudflare Workerze `chlopcy-quiz-ai`. Sam zapis pliku na GitHubie nie wdraża serwera.
- W Cloudflare są wymagane bindings `AI` (Workers AI), `LEADERBOARD` (istniejąca przestrzeń KV) oraz sekret `QUIZ_SIGNING_KEY` zawierający co najmniej 32 losowe znaki. Sekret już skonfigurowano. Nie umieszczać jego wartości w repozytorium.
- Publikując kolejne zmiany pytań, aktualizuj identycznie pulę w stronie i serwerze. Najpierw wdrażaj zgodny serwer, potem stronę.

## Zasady
Serwer losuje po dwa pytania z każdej sekcji. Sesja trwa do 4 godzin. Kolejność: sześć pytań zamkniętych, ocena IV (4 pkt), ocena V (10 pkt), wynik łącznie 20 pkt. Wynik i streszczenie pojawiają się dopiero po ocenie V. Oceniane pola blokują się na czas żądania; po błędzie można poprawić tekst i ponowić ocenę, po sukcesie pozostają zablokowane.

Po odpowiedzi zamkniętej i po ocenach IV/V losowana jest ciekawostka bez powtórek w obrębie sesji. Przycisk Dalej pozwala ją spokojnie przeczytać. Nie są potrzebne dodatkowe wywołania AI.

## Ranking
Serwer podpisuje stan kolejnych etapów i końcowy wynik. Przeglądarka wysyła do rankingu podpisany wynik, a nie samodzielnie podane punkty. Każda sesja ma osobny rekord KV w `ranking:v2:lektura:`, więc zapisy różnych uczniów nie nadpisują się. Ranking lektury pobiera wyłącznie ten przedmiot, wybierając najlepszy wynik na pseudonim. Pseudonim nie jest kontem użytkownika ani potwierdzeniem tożsamości.

Historyczny klucz `leaderboard` pozostał w KV. Dawne wyniki lektury nie są mieszane z wynikami obecnego systemu potwierdzania; dane nie zostały usunięte. Biologia zachowuje swój endpoint oceniania i historyczne wyniki. Widoczność nowych zapisów KV na innych urządzeniach może być opóźniona około 60 sekund.

## Sprawdzenie regresji
Wymagany Node.js 20 lub nowszy:

```sh
node check-literature.mjs
```

Sprawdzenie nie łączy się z produkcją i nie publikuje wyników. Symuluje odpowiedzi AI oraz magazyn KV: weryfikuje pełne /20, 5000-znakowy limit V, bramki etapów, odrzucanie powtórzonych identyfikatorów AI i sfałszowanych wyników, równoczesne zapisy, zgodność obu banków pytań oraz filtr przedmiotu. Ocenę jakości modelu i wygląd strony trzeba sprawdzać oddzielnie w przeglądarce.

## Źródła do kontroli treści
- Powieść, tekst udostępniony przez szkołę: https://www.sp11bedzin.edu.pl/wp-content/uploads/2021/04/Chlopcy-z-Palcu-Broni.pdf
- Próbka cytowanego wydania: https://booksspk.pl/DEMO_KSIAZKI/klasyka_mlodego_czytelnika_chlopcy_z_placu_broni2/files/basic-html/page14.html
