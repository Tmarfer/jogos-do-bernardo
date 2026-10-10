#!/usr/bin/env python3
"""Gera lexicon.js e os desenhos SVG das palavras novas.

As 45 figuras originais não são substituídas. Rode de novo depois de editar o catálogo.
"""
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DICT = Path("/tmp/palavras.txt")
PALETTE = [
    ("#efad4e", "#e07a7a", "#f5d486"),
    ("#e07a7a", "#f2c2c7", "#f5d486"),
    ("#81b6bb", "#f5d486", "#efad4e"),
    ("#a5c491", "#f5d486", "#81b6bb"),
    ("#f2c2c7", "#e07a7a", "#f5d486"),
    ("#f5d486", "#efad4e", "#e07a7a"),
    ("#b7c4e2", "#f2c2c7", "#f5d486"),
    ("#e6c3a0", "#a5c491", "#f5d486"),
    ("#c9b6e3", "#f2c2c7", "#b7c4e2"),
    ("#9dcdb8", "#f5d486", "#81b6bb"),
    ("#f0a07a", "#f5d486", "#e07a7a"),
    ("#d5c4a1", "#a5c491", "#81b6bb"),
]
STROKE = "#5c6b55"
ORIGINAL = {
    "bola", "casa", "pato", "gato", "sapo", "vaca", "faca", "mala", "mapa", "lata",
    "dado", "dedo", "pipa", "moto", "bota", "boca", "cama", "coco", "suco", "rato",
    "foca", "lobo", "luva", "pena", "sino", "nave", "rede", "rosa", "roda", "fogo",
    "banana", "batata", "tomate", "panela", "caneta", "cavalo", "boneca", "janela",
    "sapato", "macaco", "pipoca", "peteca", "cebola", "girafa", "camisa",
}

# drawer, nível (0 vira níveis 0 e 1), palavras
CATALOG = r"""
@mammal 0
bode mula paca tatu puma mico juba gata
@bird 0
galo peru jacu cuco
@fish 0
boto siri lula
@food 0
bolo bala sopa jaca lima figo nabo nata fava doce goma gema papa caju soja cuca tutu favo
@body 0
nuca pelo pele colo sola rabo pata
@object 0
mesa sala vaso vela teto pote copo capa fita lupa tubo taco cubo foto cabo muro lona saco bule cano cola vara rolo tela piso laje lago lama mato neve bote jato fone remo cone pino gota ramo gude vime lodo doca copa soda jipe feno vala furo lira ripa rodo toco toca tora talo gomo seta seda nota selo pufe jogo rifa saci lume cuba polo fila vila gelo fada dona mago bata caco cova dama dono gola loja mama mata muda mofo mola pano pico pulo ralo ramo rena roca rubi ruga silo solo sono sumo tira topo vale foco foro leme pala mina
@person 0
fada dona mago dama dono mama
@nature 0
lago lama mato neve gota ramo vala duna favo vime lodo feno mata muda
@vehicle 0
bote jato jipe moto
@toy 0
gude pipa bola dado

@person 2
menino menina garoto garota piloto marujo boneco
@mammal 2
gorila javali mamute camelo cadela
@bird 2
tucano coruja jaburu
@fish 2
robalo cavala
@bug 2
barata
@food 2
comida farofa jujuba salada cocada risoto ricota melado garapa cevada romero pepino salame cereja canela caneca bebida
@object 2
cabelo bigode parede gaveta tomada tapete tijolo palito canudo fivela muleta pomada vacina sucata sacola tigela tabela tecido cabide buraco buzina camada careta cinema capela coluna novelo pacote cometa cabana maleta casulo manada narina pegada topete tulipa veludo vareta valeta bolota botina cururu galope gelado peruca colete picape recado redoma regata remada safira sereno sineta sirene soneca
@nature 2
tulipa savana laguna
@tool 2
tijolo vareta cabo
@vehicle 2
picape

@person 3
cadete
@mammal 3
girino beluga
@bird 3
rapina
@bug 3
girino
@food 3
bacaba badalo babado betume filete pepita rabada farelo
@object 3
bacuri baliza bicama boleto botija calota capote caruru coreto jaleco lapela lavabo malote matuto mimosa murici pagode patada pelota pisada poda reboco rifa roleta sabugo tapera toboga vitelo vitrola batina batuta cajado casaca cerume diva docura figura jaleco luneta papiro pegada
@nature 3
mimosa savana
@place 3
cabana lavabo capela cinema tapera

@animal 4
capivara perereca vagalume mariposa pelicano pirarucu serelepe caramujo
@food 4
pirulito caramelo limonada vitamina gelatina rapadura cogumelo rabanete camomila panetone bananada gororoba tiramisu madalena panelada
@object 4
telefone camiseta gabinete capacete parafuso sabonete cotovelo camisola curativo cotonete canivete megafone cavalete secadora gasolina catarata picareta holofote serenata caravana limusine manicure pedicure figurino vilarejo camarote celofane patinete
@person 4
detetive manicure pedicure
@vehicle 4
patinete limusine caravana
@nature 4
catarata vagalume
@tool 4
parafuso picareta canivete cavalete

@food 0
sopa pera cana bife popa sebo favo
@object 0
viga tuba rata gula
@mammal 0
guri rata
@body 0
pupila
@food 2
sinuca penico bobina vitela bovina gasosa paleta gemada ricota
@object 2
remoto sinuca penico bobina biruta fedora batuta cabina calota
@animal 2
bovina bovino motora
@place 2
bodega cabina
@food 3
rabanada calamari levedura
@object 4
medicina papelada lavadora manivela vaselina parafina silicone cidadela celulose gasoduto
@person 4
jogadora lutadora nadadora
@tool 4
manivela
@place 0
beco
@mammal 0
gado neto nora
@object 0
tala
@food 2
gelado bocado bacuri babado rabada garapa
@object 2
subida resina picada galera colina recibo badalo betume bicama boleto botija capote caruru coreto murici patada pelota tapera sabugo galope tecido pagode tatame valeta recado vitelo sucata sacola vacina cometa colete sereno remada cururu
@person 2
piloto
@mammal 2
cadela
@bird 2
tucano
@object 0
bica cera duto gibi menu laca mimo sela tina fato bula cacifo pataca caneco gamela canaleta mesada novela
@food 0
tofu gole pita pomelo rolete rodela figada perada pacova sapoti tucupi milanesa gabiroba cabidela ceboleta demerara
@nature 0
juta lava teca cume lapa rama pevide peroba virola vereda ravina sucupira
@music 0
coro maraca bolero rabeca
@place 0
gala lote sacada morada camareta
@fish 0
boga pacu paru mero badejo parati bicuda betara salema tuvira pirarara sororoca coridora
@vehicle 0
biga motoca piroga caravela
@mammal 0
jabuti raposa tapiti cateto
@bird 0
pipira
@cloth 0
pijama casaco rebeca japona
@person 0
pirata judoca neta
@tool 0
gilete
@body 0
medula garupa bico risada
"""

# galo/peru were listed twice on purpose in mammal and bird; first tag wins later — fix below by not duplicating.
# The parser uses the last? I'll dedupe keeping the first occurrence.


def strip_acc(text):
    text = unicodedata.normalize("NFD", text.strip().lower())
    return "".join(char for char in text if unicodedata.category(char) != "Mn")


def dictionary_forms():
    forms = defaultdict(set)
    for line in DICT.read_text(encoding="utf-8", errors="replace").splitlines():
        word = line.strip().lower()
        if not word or any(char.isspace() or char in "-'" for char in word):
            continue
        forms[strip_acc(word)].add(word)
    return forms


def parse_catalog():
    drawer = "object"
    level = 0
    items = []
    seen = set()
    for raw in CATALOG.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("@"):
            parts = line[1:].split()
            drawer, level = parts[0], int(parts[1])
            continue
        for word in line.split():
            if word in seen or word in ORIGINAL:
                continue
            seen.add(word)
            items.append((word, level, drawer))
    return items


def el(cx, cy, rx, ry, fill):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{STROKE}" stroke-width="3"/>'


def circ(cx, cy, r, fill):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{STROKE}" stroke-width="3"/>'


def rect(x, y, w, h, fill, rx=8):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{STROKE}" stroke-width="3"/>'


def poly(points, fill):
    pts = " ".join(f"{x},{y}" for x, y in points)
    return f'<polygon points="{pts}" fill="{fill}" stroke="{STROKE}" stroke-width="3" stroke-linejoin="round"/>'


def eye(x, y):
    return f'<circle cx="{x}" cy="{y}" r="3.2" fill="#4e4946"/>'


def svg(body):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 180">'
        '<circle cx="105" cy="90" r="74" fill="#f6f1e6"/>'
        f"{body}</svg>"
    )


def draw(kind, variant):
    main, accent, soft = PALETTE[variant % len(PALETTE)]
    spot = variant % 5
    if kind in {"mammal", "animal"}:
        ears = spot
        body = el(112, 112, 46, 30, main)
        head = circ(68, 78, 26, soft)
        if ears == 0:
            ear = poly([(52, 62), (40, 28), (66, 52)], accent) + poly([(84, 52), (96, 24), (78, 64)], accent)
        elif ears == 1:
            ear = el(48, 58, 10, 14, accent) + el(86, 56, 12, 16, accent)
        elif ears == 2:
            ear = circ(50, 52, 10, accent) + circ(84, 50, 11, accent)
        elif ears == 3:
            ear = poly([(58, 58), (48, 18), (78, 48)], accent)
        else:
            ear = ""
        spots = ""
        if spot in {0, 3}:
            spots = f'<circle cx="108" cy="104" r="7" fill="{accent}"/><circle cx="128" cy="120" r="5" fill="{accent}"/>'
        tail = poly([(150, 100), (184, 78), (168, 118)], accent) if spot % 2 == 0 else poly([(148, 112), (186, 124), (150, 132)], accent)
        return svg(body + tail + head + ear + spots + eye(60, 76) + eye(76, 76) + el(58, 90, 8, 5, accent))
    if kind == "bird":
        return svg(
            el(112, 112, 40, 26, main)
            + circ(74, 82, 22, soft)
            + poly([(52, 82), (24, 74), (50, 96)], accent)
            + poly([(140, 100), (184, 86), (150, 124)], soft)
            + rect(78, 132, 6, 22, accent, 2)
            + rect(98, 132, 6, 22, accent, 2)
            + (poly([(70, 62), (78, 36), (88, 64)], accent) if spot % 2 == 0 else "")
            + eye(68, 80)
        )
    if kind == "fish":
        return svg(
            el(108, 96, 48, 26, main)
            + poly([(150, 96), (186, 70), (186, 122)], accent)
            + poly([(90, 78), (110, 58), (120, 84)], soft)
            + eye(78, 92)
        )
    if kind == "bug":
        wing = el(92, 78, 22, 30, soft) + el(122, 78, 22, 30, accent) if spot % 2 == 0 else ""
        return svg(wing + el(105, 108, 36, 24, main) + circ(105, 74, 16, soft) + eye(99, 72) + eye(111, 72))
    if kind in {"food", "sweet"}:
        if spot == 0:
            return svg(circ(105, 100, 40, main) + poly([(105, 62), (96, 40), (118, 58)], accent) + el(118, 70, 14, 8, "#6f9460"))
        if spot == 1:
            return svg(el(105, 108, 50, 22, main) + rect(70, 86, 70, 28, soft) + circ(88, 78, 7, accent) + circ(122, 78, 7, "#81b6bb") + rect(100, 58, 10, 24, "#f5d486", 3))
        if spot == 2:
            return svg(poly([(70, 120), (105, 48), (140, 120)], main) + el(105, 120, 36, 12, soft))
        if spot == 3:
            return svg(rect(68, 78, 74, 48, main, 16) + rect(78, 88, 54, 10, soft, 4) + circ(105, 70, 10, accent))
        return svg(el(105, 108, 42, 24, soft) + circ(88, 96, 16, main) + circ(112, 90, 16, accent) + circ(124, 108, 14, "#f5d486"))
    if kind == "drink":
        return svg(poly([(78, 70), (92, 132), (128, 132), (140, 70)], soft) + rect(74, 62, 70, 14, main, 6) + rect(132, 78, 8, 36, accent, 3))
    if kind == "body":
        return svg(circ(105, 78, 28, soft) + el(105, 124, 26, 18, main) + eye(96, 76) + eye(114, 76) + el(105, 90, 8, 5, accent))
    if kind == "person":
        return svg(circ(105, 62, 22, soft) + poly([(70, 140), (105, 86), (140, 140)], main) + rect(96, 78, 18, 16, accent, 4) + eye(98, 60) + eye(112, 60))
    if kind == "nature":
        return svg(
            rect(98, 108, 14, 40, "#8d6b45", 4)
            + circ(78, 86, 22, main)
            + circ(112, 70, 26, accent)
            + circ(136, 96, 18, soft)
        )
    if kind == "vehicle":
        return svg(
            poly([(46, 112), (70, 78), (150, 78), (176, 112)], main)
            + rect(78, 86, 36, 22, "#d7eef2", 4)
            + circ(72, 124, 14, "#4e4946")
            + circ(150, 124, 14, "#4e4946")
            + circ(72, 124, 6, soft)
            + circ(150, 124, 6, soft)
        )
    if kind == "toy":
        return svg(circ(105, 96, 36, main) + rect(70, 78, 70, 8, soft, 3) + rect(70, 108, 70, 8, accent, 3))
    if kind == "tool":
        return svg(rect(96, 48, 16, 78, soft, 4) + rect(64, 40, 80, 22, main, 6) + circ(105, 132, 10, accent))
    if kind == "cloth":
        return svg(poly([(70, 70), (105, 96), (140, 70), (150, 140), (60, 140)], main) + rect(92, 78, 26, 14, soft, 4))
    if kind == "music":
        return svg(rect(78, 48, 10, 70, STROKE, 3) + el(70, 118, 18, 12, main) + rect(88, 48, 40, 8, STROKE, 2))
    if kind == "place":
        return svg(poly([(48, 96), (105, 48), (162, 96)], accent) + rect(64, 96, 82, 48, main, 4) + rect(94, 112, 22, 32, soft, 2) + rect(78, 108, 16, 16, "#d7eef2", 2))
    # object and fallback
    if spot == 0:
        return svg(rect(62, 70, 86, 62, main, 12) + rect(78, 84, 54, 12, soft, 4) + circ(105, 112, 8, accent))
    if spot == 1:
        return svg(circ(105, 96, 42, main) + circ(105, 96, 18, soft) + circ(105, 96, 7, accent))
    if spot == 2:
        return svg(rect(70, 78, 70, 56, main, 10) + poly([(70, 78), (105, 48), (140, 78)], accent))
    if spot == 3:
        return svg(el(105, 108, 48, 28, main) + rect(90, 64, 30, 28, soft, 6))
    return svg(poly([(105, 48), (160, 120), (50, 120)], main) + circ(105, 108, 10, soft))


def spelling_ok(word, freq, by_norm, pattern):
    if not pattern.match(word):
        return False
    plain = freq.get(word, 0)
    accented = [count for count, form in by_norm.get(word, []) if form != word]
    if accented and max(accented) > plain:
        return False
    return True


def balance(items):
    groups = {2: [], 3: [], 4: []}
    for word, _level, drawer in items:
        groups[len(word) // 2].append((word, drawer))
    balanced = []
    for word, drawer in groups[2]:
        balanced.append((word, 0, drawer))
    for index, (word, drawer) in enumerate(groups[3]):
        balanced.append((word, 2 if index < len(groups[3]) / 2 else 3, drawer))
    for index, (word, drawer) in enumerate(groups[4]):
        balanced.append((word, 4 if index < len(groups[4]) / 2 else 5, drawer))
    return balanced


def main():
    forms = dictionary_forms()
    del forms
    freq = {}
    for line in Path("/tmp/pt_br_50k.txt").read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) >= 2:
            freq[parts[0].lower()] = int(parts[1])
    by_norm = defaultdict(list)
    for form, count in freq.items():
        by_norm[strip_acc(form)].append((count, form))
    pattern = re.compile(r"^([bcdfgjlmnprstv][aeiou]){2,4}$")
    kept = []
    rejected = []
    for word, level, drawer in parse_catalog():
        if not spelling_ok(word, freq, by_norm, pattern):
            rejected.append(word)
            continue
        if len(word) // 2 not in {2, 3, 4}:
            rejected.append(word)
            continue
        kept.append((word, level, "mammal" if drawer == "animal" else drawer))
    kept = balance(kept)
    lines = [
        "// Banco gerado por scripts/build_lexicon.py. Palavras novas, sem acento e só com sílabas consoante-vogal.",
        "(function (root) {",
        "  'use strict';",
        "  const extras = [",
    ]
    for index, (word, level, drawer) in enumerate(kept):
        syllables = [word[i:i + 2].upper() for i in range(0, len(word), 2)]
        membership = [0, 1] if level == 0 else [level]
        description = f"Desenho de {word}"
        syl = ", ".join(f"'{part}'" for part in syllables)
        levels = ", ".join(str(item) for item in membership)
        lines.append(f"    ['{word}', '{word.upper()}', [{syl}], '{description}', [{levels}]],")
        target = ROOT / "assets" / f"{word}.svg"
        if word not in ORIGINAL:
            target.write_text(draw(drawer, index), encoding="utf-8")
    lines += [
        "  ];",
        "  if (typeof module !== 'undefined' && module.exports) module.exports = extras;",
        "  else root.SilabasLexicon = extras;",
        "})(typeof window !== 'undefined' ? window : globalThis);",
        "",
    ]
    (ROOT / "lexicon.js").write_text("\n".join(lines), encoding="utf-8")
    print(f"kept {len(kept)} rejected {len(rejected)}")
    if rejected:
        print("rejected:", " ".join(rejected))
    from collections import Counter
    print(Counter(level for _, level, _ in kept))


if __name__ == "__main__":
    main()
