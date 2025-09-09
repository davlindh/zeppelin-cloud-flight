# Bilder för Zeppel Inn Community Showcase

Denna katalog innehåller alla bilder som används i showcase-applikationen.

## Struktur

```
public/images/
├── participants/
│   ├── volodymyr-gulich.jpg    # 100x100px rekommenderat
│   ├── anastasiya-loyko.jpg
│   ├── irina-novokrescionova.jpg
│   ├── hannes-holgerson.jpg
│   ├── jonatan-haner.jpg
│   └── [andra-deltagare].jpg
├── projects/
│   ├── placeholder-project.jpg # 600x400px rekommenderat
│   ├── velkyi-luh.jpg         # För "Digital Måleri Workshop: Velykyi Luh"
│   ├── fangla-fantasi.jpg     # För "Videoperformance: Fånga din Fantasi"
│   ├── cooking-potato.jpg     # För "Livemusik: Cooking Potato & Jonatan Haner"
│   └── [projekt-namn].jpg
└── ui/
    ├── placeholder-avatar.svg  # SVG placeholder för avatar utan bild
    └── placeholder-project.svg # SVG placeholder för projekt utan bild
```

## Rekommendationer

### Participanter (Avatarer)
- **Storlek**: 100x100px eller större (kvadratiska)
- **Format**: JPG/PNG rekommenderas för komprimering
- **Bakgrund**: Transparent eller vita prefereras
- **Kvalitet**: Medium-high (80-90% JPEG kvalitet)

### Projekt-bilder
- **Storlek**: Minst 600x400px för desktop, beräknas responsivt
- **Format**: JPG för fotografier, PNG för grafik med transparens
- **Aspekt**: 3:2 eller liknande bredbildsformat
- **Kvalitet**: Medium (70-80% JPEG kvalitet) för balans mellan storlek och kvalitet

## Användning

Bilder refereras via absoluta sökvägar från roten:
```javascript
// I komponenterna
imgSrc="/images/projects/velkyi-luh.jpg"
avatarSrc="/images/participants/volodymyr-gulich.jpg"
```

## Placeholder-system

Applikationen har automatiskt fallback-system:
- Saknade projektbilder → `/images/ui/placeholder-project.svg`
- Saknade avatarer → Initialer-generator eller placeholder

## Tillagda riktiga bilder

När du lägger till riktiga bilder:

1. Kopiera bild till rätt undermapp
2. Uppdatera `constants/index.ts` med rätt sökväg om nödvändigt
3. Kontrollera i webbläsaren att bilderna laddas korrekt

## Preliminära bilder

Här är en lista över vilka bilder som främst behöver läggas till:

**Projekt-bilder:**
- `velkyi-luh.jpg` - Konstnärlig stenhuggare/graffitimåleri på port
- `fangla-fantasi.jpg` - Videoinstallation med teknologiska element
- `cooking-potato.jpg` - Ambient musikband
- `kress-workshop.jpg` - Teknik-workshop på BTH
- `stenhugg-handverk.jpg` - Hantverksdemonstration
- `drone-show.jpg` - Drönarshow över skärgården

**Participant-avatarer:**
Alla avatarer i deltagarprofilerna innehåller för tillfället externa Lorem Picsum-bilder som kan bytas ut mot verkliga porträtt.
