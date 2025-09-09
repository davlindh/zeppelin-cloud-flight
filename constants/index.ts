import type { ShowcaseCard } from '../types/index';

export const NAV_LINKS = [
    { href: '#vision', label: 'Vision' },
    { href: '#systematik', label: 'Systematik' },
    { href: '/showcase', label: 'Showcase' },
    { href: '/participants', label: 'Deltagare' },
    { href: '#partner', label: 'Partners' },
];

export const INITIAL_CARDS: ShowcaseCard[] = [
    {
        id: '1',
        title: 'KRESS & ROBOT WORKSHOP',
        description: 'Utforska automation som ett konstnärligt verktyg, från simulering på BTH till storskaliga landskapskonstverk med Kress-robotar.',
        imageUrl: '/images/projects/placeholder-project.jpg',
        fullDescription: 'I detta intensiva tvåveckorsprogram utforskar vi samspelet mellan teknik och konst genom praktisk användning av automatiserade Kress-robotar. Genom att kombinera parametrisk design, realtids-simulering och storskaliga materialtransformationer, skapar deltagarna unika konstverk som utmanar gränserna mellan digital konceptualisering och fysiskt hantverk.',
        tags: ['Automation', 'Konst', 'Teknik', 'Robotics'],
        participants: [
            {
                name: 'Anna Karlsson',
                role: 'Ledande Workshopfacilitator',
                bio: 'Specialiserad på intersectionell teknikkonst med 8 år erfarenhet från industridesign.',
                avatar: 'https://picsum.photos/seed/anna/100/100',
            },
            {
                name: 'Marcus Lindström',
                role: 'Robotexpert',
                bio: 'MSc i Mekatronik från KTH, driver eget företag inom automationslösningar.',
                avatar: 'https://picsum.photos/seed/marcus/100/100',
            },
        ],
        links: [
            { type: 'demo' as const, url: 'https://example.com/kress-demo' },
            { type: 'website' as const, url: 'https://kaggle.com/kress-workshop' }
        ],
    },
    {
        id: '4',
        title: 'DIGITAL MÅLERI WORKSHOP: VELYKUI LUH',
        description: 'Ukrainsk konstnär Volodymyr Gulich målar på portarna under veckan och bjuder in publiken att delta i att fullborda verket tillägnat det ukrainska landskapet.',
        imageUrl: '/images/projects/placeholder-project.jpg',
        fullDescription: 'Konstnären Volodymyr Gulich kommer under veckan att måla på portarna till arbetsgaraget. På festivaldagen den 27 september bjuder han in alla intresserade att delta i färdigställandet av målningen "Velykyi Luh" (Den stora ängen), som konstnären tillägnar det legendariska området nedanför Dneprs forsar - platsen där det ursprungliga kosackområdet Zaporizka Sitj låg, och där den sprängda Kachovka-dammen och det ockuperade kärnkraftverket nu befinner sig.',
        tags: ['Ukrainsk Konst', 'Digital Måleri', 'Graffiti', 'Zaporizka'],
        participants: [
            {
                name: 'Volodymyr Gulich',
                role: 'Konstnär & Kurator',
                bio: 'Ukrainsk-konstnär bosatt i Sverige och Ukraina. Examen från Lvivs nationella konstakademi. Arbetar med digital konst, NFT-projekt och internationella utställningar i USA, Tyskland och Japan.',
                avatar: 'https://picsum.photos/seed/volodymyr/100/100',
            },
        ],
        links: [
            { type: 'website' as const, url: 'https://example.com/velykui-luh-project' }
        ],
    },
    {
        id: '5',
        title: 'VIDEOPERFORMANCE: FÅNGA DIN FANTASI',
        description: 'Anastasiya Loyko skapar en deltagande videoinstallation där publiken blir både åskådare och skapare - filma ön och bli del av robot-drönar-performance.',
        imageUrl: '/images/projects/placeholder-project.jpg',
        fullDescription: 'Hon ber alla som vill, och även de som inte vill, att filma ön med korta, 10-15 sekunder långa klipp. Det kan vara natur, hus, skuggor, rörelser – ögonblick som får dig att säga "Wow!". Videoprojektion på Vita Huset, drönare från ovan och robotgräsklippare skapar en multisensorisk upplevelse. Publiken blir samtidigt både objekt och skapare av filmen, vilket helt realiserar begreppet "Fånga din Fantasi" genom att kombinera film, teknologi och öns unika atmosfär.',
        tags: ['Video Art', 'Drönare', 'Robotik', 'Publikdeltagande'],
        participants: [
            {
                name: 'Anastasiya Loyko',
                role: 'Konstnär & Curator',
                bio: 'Ukrainsk konstnär bosatt i Sverige. Medlem av konstgruppen Artzebs. Arbetar med digital konst, NFT och videomapping. Har ställt ut i USA, Österrike, Tyskland och Ukraina.',
                avatar: 'https://picsum.photos/seed/anastasiya/100/100',
            },
            {
                name: 'Irina Novokrescionova',
                role: 'Visual Artist & Performance',
                bio: 'Karlskronakonstnär från Litauen/Sverige. Målar stadsmotiv, blommor och hav i akvarell. Håller målarworkshops och utför restaurering.',
            },
        ],
        links: [
            { type: 'demo' as const, url: 'https://example.com/fangla-din-fantasi' },
            { type: 'website' as const, url: 'https://example.com/anastasiya-loyko' }
        ],
    },
    {
        id: '6',
        title: 'LIVEMUSIK: COOKING POTATO & JONATAN HANER',
        description: 'Ambient/experimentellt band från södra Sverige presenterar filmisk ljudexperiment med egna instrument och elektroniska ljudlandskap.',
        imageUrl: '/images/projects/placeholder-project.jpg',
        fullDescription: 'COOKING POTATO är ett ambient/experimentellt band från södra Sverige som bildades i början av Rysslands invasion av Ukraina på IFÖ CENTER i Bromölla. Bandet experimenterar ständigt med ljud och instrument och skapar sina egna. Under festivalen kommer vi höra deras unika ljudvärld som är tydligt filmisk i naturen, skräddarsydd för konstnärliga upplevelser och potentiella soundtracks.',
        tags: ['Ambient Musik', 'Experimentellt', 'Elektronika', 'Filmisk Ljud'],
        participants: [
            {
                name: 'Hannes Holgerson',
                role: 'Musiker & Artist',
                bio: 'Svensk musiker verksam inom experimentell ljudkonst.',
                avatar: 'https://picsum.photos/seed/hannes/100/100',
            },
            {
                name: 'Jonatan Haner',
                role: 'Multiinstrumentalist',
                bio: 'Konstnär från USA/Sverige/Ukraina. Arbetar med multiinstrumental ljudkonst och skapar egna instrument.',
            },
        ],
        links: [
            { type: 'demo' as const, url: 'https://example.com/cooking-potato-music' }
        ],
    },
    {
        id: '2',
        title: 'STENHUGGERI & HANTVERK',
        description: 'Förankra ditt skapande i regionens materiella kultur. Lär dig traditionella tekniker som stenhuggeri, smide och keramik av lokala mästare.',
        imageUrl: '/images/projects/placeholder-project.jpg',
        fullDescription: 'Genom fördjupad kunskap om regionala materialkulturer och hantverkstekniker, utforskar vi hur traditionella kunskaper kan integreras med moderna konstnärliga uttryck. Under två veckor arbetar deltagarna med lokala stenhuggare, smeder och keramiker för att skapa verk som både hedrar traditionen och utmanar nutida berättande.',
        tags: ['Hantverk', 'Sten', 'Keramik', 'Tradition'],
        participants: [
            {
                name: 'Elsa Eriksson',
                role: 'Hantverksmästare',
                bio: 'Generationellt stenhuggare med över 30 år i yrket, arbetat på slottsprojekt över hela Sverige.',
                avatar: 'https://picsum.photos/seed/elsa/100/100',
            },
        ],
        links: [
            { type: 'github' as const, url: 'https://github.com/zeppelinn-handwerk' }
        ],
    },
    {
        id: '3',
        title: 'DRÖNARSHOW: TREE OF LIGHT',
        description: 'En spektakulär ljusshow över skärgården som symboliserar projektets syntes och evolution – en oförglömlig final.',
        imageUrl: '/images/projects/placeholder-project.jpg',
        fullDescription: 'Sammansmältningen av alla Zeppel Inn-program i en poetisk ljusmanifestation över Blekinges skärgård. Med över 50 programmerbara drönare skapar vi ett levande konstverk som förändras i realtid baserat på deltagarnas gemensamma resa. Showen undersöker teman om tillväxt, nätverk och kollektiv intelligens genom ljus, rörelse och ljud.',
        tags: ['Drone', 'Ljus', 'Performance', 'Skärgård'],
        participants: [
            {
                name: 'David Svensson',
                role: 'Drone-programmerare',
                bio: 'Software engineer med ekspertise i realtids multimediaproduktion och 3D-visualisering.',
                avatar: 'https://picsum.photos/seed/david/100/100',
            },
            {
                name: 'Lisa Nilsson',
                role: 'Ljusdesigner & Koreograf',
                bio: 'Fokuserar på immersiva upplevelser och har arbetat med ljusdesign för stora svenska konstnärliga produktioner.',
            },
        ],
        links: [
            { type: 'demo' as const, url: 'https://example.com/drone-show-demo' },
            { type: 'website' as const, url: 'https://zepp.elinn.se/tree-of-light' }
        ],
    },
];
