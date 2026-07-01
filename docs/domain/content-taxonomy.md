# Content Taxonomy

> Fuente de verdad del catálogo de categorías y subcategorías en ididntcatchthat.  
> Implementación en código: `apps/api/src/shared/domain/learning-module.ts` y `apps/api/src/shared/domain/subcategory-taxonomy.ts` (slugs + validación). Metadatos i18n del catálogo: `apps/api/src/content/flashcard/domain/subcategory-catalog.ts`.

---

## Categorías (slug = código = DB)

| Slug | Label ES | Label EN |
|------|----------|----------|
| `native_sounds` | Sonidos nativos | Native Sounds |
| `connected_speech` | Habla conectada | Connected Speech |
| `flow_connectors` | Fluidez y conectores | Flow & Connectors |
| `real_talk` | Inglés de calle | Real Talk |

Estos cuatro slugs se usan de forma unificada en Content (`flashcards.category`), Gaming (`Game.module`), Progress (`ModuleName`) y el cliente (i18n, filtros, configuración de juego).

---

## Convención de nomenclatura

### Reglas

- **Native Sounds:** un sonido por subcategoría — granularidad pedagógica por fonema o fenómeno.
- **Slugs propios:** `{letra}_{palabra_ancla}` para consonantes, `vowel_{descriptor}` para vocales, descripción del fenómeno para connected speech.
- **Labels:** descriptivos en español primero, con palabra ancla entre paréntesis cuando ayuda.

### Patrones prohibidos

| Prohibido | Usar en su lugar |
|-----------|------------------|
| `THE_X_SOUND`, `sound_x` | `x_vacation`, label "V de vacation" |
| `SOUND_X_AS_IN_Y`, `a_in_cake` | `vowel_long_a`, label "Vocal larga (cake)" |
| `FLAP_T_PARTY_CITY`, `flap_t` | `t_soft_between_vowels` |
| `BONUS_*`, pares de lección | — eliminar |
| `WANNA_AND_GONNA`, `wanna_gonna` | `informal_going_to` |
| Pares comparativos en un slug | Un sonido = un slug |

---

## Native Sounds (`native_sounds`)

### Fenómenos

| Slug | Label ES | Label EN | anchorExamples |
|------|----------|----------|----------------|
| `t_soft_between_vowels` | T suave entre vocales (water, city) | Soft T between vowels (water, city) | water, city, party |
| `t_cut_at_end` | T cortada al final (cat, what) | Cut T at word end (cat, what) | cat, what, it |
| `vowel_unstressed` | Vocal débil (about, the) | Unstressed vowel (about, the) | about, banana, the |

### Consonantes

| Slug | Label ES | Label EN | anchorExamples |
|------|----------|----------|----------------|
| `b_ball` | B de ball | B in ball | ball, bee, about |
| `ch_child` | CH de child | CH in child | child, teacher, watch |
| `d_dog` | D de dog | D in dog | dog, ladder, red |
| `f_fish` | F de fish | F in fish | fish, coffee, off |
| `g_go` | G de go | G in go | go, egg, bigger |
| `h_house` | H de house | H in house | house, behind, hello |
| `j_job` | J de job | J in job | job, bridge, age |
| `k_key` | K de key | K in key | key, back, school |
| `l_light` | L de light | L in light | light, play, feel |
| `m_me` | M de me | M in me | me, summer, time |
| `n_no` | N de no | N in no | no, dinner, sun |
| `ng_sing` | NG de sing | NG in sing | sing, running, thing |
| `p_pen` | P de pen | P in pen | pen, happy, stop |
| `r_red` | R de red | R in red | red, car, better |
| `s_sit` | S de sit | S in sit | sit, bus, miss |
| `sh_shoe` | SH de shoe | SH in shoe | shoe, wash, mission |
| `t_time` | T de time | T in time | time, table, stop |
| `th_that` | TH de that (vibrante) | TH in that (voiced) | that, this, mother |
| `th_think` | TH de think (sorda) | TH in think (voiceless) | think, three, mouth |
| `v_vacation` | V de vacation | V in vacation | very, vacation, love |
| `w_we` | W de we | W in we | we, away, quick |
| `y_yes` | Y de yes | Y in yes | yes, you, beyond |
| `z_zoo` | Z de zoo | Z in zoo | zoo, buzz, is |

### Vocales

| Slug | Label ES | Label EN | anchorExamples |
|------|----------|----------|----------------|
| `vowel_short_a` | Vocal corta (cat) | Short vowel (cat) | cat, hat, map |
| `vowel_long_a` | Vocal larga (cake) | Long vowel (cake) | cake, hate, name |
| `vowel_short_e` | Vocal corta (bed) | Short vowel (bed) | bed, red, said |
| `vowel_long_e` | Vocal larga (he) | Long vowel (he) | he, see, meet |
| `vowel_short_i` | Vocal corta (ship) | Short vowel (ship) | ship, bit, sit |
| `vowel_long_i` | Vocal larga (sheep) | Long vowel (sheep) | sheep, beat, meet |
| `vowel_short_o` | Vocal corta (got) | Short vowel (got) | got, hot, stop |
| `vowel_long_o` | Vocal larga (open) | Long vowel (open) | open, hope, go |
| `vowel_short_u` | Vocal corta (cut) | Short vowel (cut) | cut, bus, love |
| `vowel_long_u` | Vocal larga (food) | Long vowel (food) | food, pool, move |
| `vowel_u_look` | Vocal de look | Vowel in look | look, book, good |
| `vowel_aw_law` | Vocal de law | Vowel in law | law, saw, call |
| `vowel_ar_car` | Vocal de car | Vowel in car | car, far, start |
| `vowel_er_bird` | Vocal de bird | Vowel in bird | bird, word, turn |
| `vowel_air_hair` | Vocal de hair | Vowel in hair | hair, care, where |
| `vowel_ear_hear` | Vocal de hear | Vowel in hear | hear, near, beer |
| `vowel_oy_boy` | Vocal de boy | Vowel in boy | boy, join, voice |

### Extras

| Slug | Label ES | Label EN | anchorExamples |
|------|----------|----------|----------------|
| `syllable_stress` | Acento en la palabra | Word stress | REcord, reCORD |
| `silent_letters` | Letras mudas | Silent letters | listen, knife, doubt |

---

## Connected Speech (`connected_speech`)

| Slug | Label ES | Label EN | anchorExamples |
|------|----------|----------|----------------|
| `informal_going_to` | Contracciones de futuro | Future contractions | gonna, wanna, gotta |
| `informal_kind_of` | Kinda / sorta | Kinda / sorta | kinda, sorta |
| `informal_out_of` | Outta / lotta | Outta / lotta | outta, lotta |
| `assimilated_you` | Didja / dontcha | Didja / dontcha | didja, dontcha |
| `word_linking` | Enlace entre palabras | Word linking | an apple, turn off |
| `dropped_consonants` | Consonantes que desaparecen | Dropped consonants | next day, most people |
| `phrase_stress` | Acento en frases conectadas | Stress in connected phrases | I wanna GO |

---

## Flow & Connectors (`flow_connectors`)

| Slug | Label ES | Label EN | anchorExamples |
|------|----------|----------|----------------|
| `contrast` | Contraste | Contrast | however, on the other hand |
| `addition` | Añadir ideas | Adding ideas | furthermore, in addition |
| `emphasis` | Énfasis | Emphasis | indeed, above all |
| `time_sequence` | Tiempo y secuencia | Time and sequence | meanwhile, eventually |
| `giving_examples` | Dar ejemplos | Giving examples | for instance, such as |
| `reason_result` | Causa y resultado | Reason and result | therefore, as a result |
| `summary` | Resumir | Summarizing | in short, to sum up |
| `meetings` | Reuniones | Meetings | let's circle back |
| `presentations` | Presentaciones | Presentations | moving on to |

---

## Real Talk (`real_talk`)

| Slug | Label ES | Label EN | anchorExamples |
|------|----------|----------|----------------|
| `casual_responses` | Respuestas casuales | Casual responses | I'm good, no worries |
| `phrasal_verbs` | Phrasal verbs | Phrasal verbs | hang out, figure out |
| `fillers` | Muletillas | Fillers | I mean, you know |
| `vague_nouns` | Sustantivos vagos | Vague nouns | stuff, thing |
| `address_forms` | Formas de dirigirse | Address forms | you guys, folks |
| `informal_slang` | Slang informal | Informal slang | ain't, kinda |
| `everyday_verbs` | Verbos del día a día | Everyday verbs | grab, make it |

---

## Referencias

- [ADR-024: Content Taxonomy](../adr/024-content-taxonomy.md)
- [Spec: Content](../spec/content.md)
- API catalog endpoint: `GET /v1/catalogs/categories`
