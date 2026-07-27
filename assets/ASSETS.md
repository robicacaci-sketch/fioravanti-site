# Cartella immagini — cosa metterci

Ritaglia le foto dai post Instagram (senza frecce/commenti/bolle repost) e salvale QUI
con questi nomi esatti. Il sito le aggancia da solo, niente codice da toccare.

| File            | Contenuto suggerito                                        |
|-----------------|------------------------------------------------------------|
| era-ferrari.jpg | Foto d'epoca: Daytona rossa + 308 bianca con Leonardo      |
| era-concept.jpg | Leonardo con i prototipi giallo/nero in cortile            |
| era-dino.jpg    | Tavola sketch "Ricerca Dino 2009" (gialla o rossa)         |
| era-lf1.jpg     | LF1 tricolore sulla collina o davanti al garage            |
| film.mp4        | Video promo (16:9) — appare nella sezione "Il Film"        |

Formato consigliato: JPG ~1600px lato lungo. Video: MP4 H.264.

## Video in movimento (opzionali)

Se ci sono, il sito li usa da solo; se mancano, resta tutto come adesso.

Ogni riga vuole **due file**, `.mp4` e `.webm` (li produce `motion/encode.sh` in un colpo solo).
Il sito li carica solo quando stanno per entrare nello schermo, e mai se il browser
chiede "meno animazioni".

| File                    | Dove finisce                                               |
|-------------------------|------------------------------------------------------------|
| hero-loop.*             | Loop 6–8s del cofano con la lama di luce — sfondo dell'apertura |
| manifesto-loop.*        | Fondo scuro in carbonio dietro "IL CORAGGIO DELLA SEMPLICITÀ" |
| sketch-loop.*           | Fondo carta dietro il disegno che si costruisce (LA RICERCA) |
| era-ferrari-loop.*      | Cinemagraph sulla prima card della timeline                |
| era-concept-loop.*      | Cinemagraph sulla seconda card                             |
| era-dino-loop.*         | Cinemagraph sulla terza card                               |
| era-lf1-loop.*          | Cinemagraph sulla quarta card                              |
| film-poster.jpg         | Fermo immagine mostrato prima di far partire il film       |

`era-ferrari` e `era-concept` ritraggono **persone reali**: prima di pubblicarle animate
serve l'ok dell'amico — vedi il piano `docs/plans/2026-07-19-001`. `era-dino` (tavola
stampata) e `era-lf1` (auto sulla collina) non ritraggono nessuno e sono già animate.

Specifiche e prompt: `motion/G1-hero-loop.md`. Conversione: `bash motion/encode.sh <file> [nome]`,
per esempio `bash motion/encode.sh ~/Downloads/render.mp4 manifesto-loop`.
