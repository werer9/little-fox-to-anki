import {Package, Deck, Note, Model, Field, Card, Media} from "anki-apkg-generator"


const createAnkiFile = async (vocabList: VocabListEntry[]) => {
    const fields = [
        {name: 'Chinese'},
        {name: 'Pinyin'},
        {name: 'English'},
        {name: 'Audio'},
        {name: 'Example'},
    ]

    const card = new Card()
    card.setCss().setTemplates([
        {
            name: 'Little Fox Chinese to English Card',
            qfmt: '{{Chinese}}<br>{{Audio}}',
            afmt: '{{FrontSide}}<hr id="answer">{{Pinyin}}<br>{{English}}<br>{{Example}}',
        },
    ])

    const model = new Model(card)
    model
        .setName('Little Fox Note')
        .setFields(fields.map((f, index) => new Field(f.name).setOrd(index)))


    const deck = new Deck(`Little Fox`)
    const mediaItems: Media[] = []

    for (const item of vocabList) {
        const note = new Note(model)
        const media: Awaited<Promise<Media>> = await fetch(item.audioUrl).then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error, status = ${response.status}`);
            }
            return response.arrayBuffer();
        }).then((data) => {
            return new Media(data, `${item.chinese}.mp3`)
        });
        note.setFieldsValue([
            item.chinese,
            item.pinyin,
            item.english,
            `[sound:${item.chinese}.mp3]`,
            item.exampleSentence
        ])
        console.log(note.fieldsValue)
        deck.addNote(note)
        mediaItems.push(media)
    }

    console.log(deck.notes)
    return new Package(deck, mediaItems)
}

export default createAnkiFile;