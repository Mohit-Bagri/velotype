const wordLists = {
  english: [
    "the","be","to","of","and","a","in","that","have","i","it","for","not","on","with",
    "he","as","you","do","at","this","but","his","by","from","they","we","say","her","she",
    "or","an","will","my","one","all","would","there","their","what","so","up","out","if",
    "about","who","get","which","go","me","when","make","can","like","time","no","just",
    "him","know","take","people","into","year","your","good","some","could","them","see",
    "other","than","then","now","look","only","come","its","over","think","also","back",
    "after","use","two","how","our","work","first","well","way","even","new","want",
    "because","any","these","give","day","most","us","great","between","need","large",
    "under","never","each","right","hand","high","place","small","found","head","still",
    "own","should","home","big","long","world","school","every","point","self","old",
    "while","keep","where","light","same","another","begin","story","four","might","run",
    "always","house","put","end","why","off","turn","move","water","much","city","change",
    "name","play","near","live","part","help","show","thought","went","group","food",
    "line","life","children","side","kind","book","often","state","read","close","night",
    "real","open","seem","together","next","white","hard","left","best","door","sure",
    "become","above","young","sun","room","air","body","mind","face","done","love","car",
    "power","stand","father","land","away","talk","thing","last","girl","boy","eye","hear",
    "stop","few","paper","tree","earth","walk","watch","river","horse","today","many",
    "write","mother","money","answer","music","learn","color","three","class","word","feel",
    "set","start","half","number","hold","fire","question","fish","mountain","north","once",
    "base","along","ask","south","bring","letter","morning","family","across","second",
    "quite","able","street","build","remember","through","both","during","order","against",
    "table","system","form","early","idea","area","ready","clear","space","problem","ground",
    "level","field","ever","fast","blue","road","deep","center","voice","person","dark",
    "draw","note","fall","front","plain","study","call","later","pass","reach","rest","stay",
    "warm","full","sing","care","age","strong","may","simple","cold","list","sense","check",
    "sit","free","cover","step","mile","example","mark","boat","top","cut","short","sleep",
    "drive","late","better","true","sea","develop","window","grow","test","bit","low","pick",
    "govern","more","very","man","such","much","before","too","mean","let","been","made",
    "again","must","tell","does",
  ],
  spanish: [
    "de","la","que","el","en","y","a","los","se","del","las","un","por","con","no","una",
    "su","para","es","al","lo","como","pero","sus","le","ya","o","fue","este","ha","si",
    "porque","esta","son","entre","cuando","muy","sin","sobre","ser","tiene","todo","hay",
    "vida","solo","puede","tiempo","ella","gobierno","casa","mundo","gran","bien","mismo",
    "hace","forma","parte","donde","hombre","agua","dia","mucho","poco","antes","algo",
    "ciudad","nuevo","mejor","nada","cada","estado","vez","menos","pueblo","bueno","tres",
    "lado","trabajo","desde","cuenta","grupo","punto","libro","decir","largo","alto","poder",
    "grande","mujer","nombre","calle","tierra","hijo","mano","cuerpo","palabra","padre",
    "familia","joven","noche","pais","campo","lugar","cosa","momento","cabeza","cara",
    "ejemplo","clase","hora","puerta","paso","fuerza","historia","orden","juego","mesa",
  ],
  french: [
    "de","la","le","et","les","des","en","un","du","une","que","est","pour","qui","dans",
    "ce","il","pas","plus","par","sur","se","son","ne","au","avec","tout","mais","sa",
    "comme","leur","ou","nous","ses","fait","elle","bien","aussi","entre","deux","ces",
    "autre","avant","donc","encore","notre","sans","peu","alors","temps","vie","jour",
    "homme","monde","grand","chose","pays","nom","ville","main","coup","place","mot",
    "point","droit","porte","terre","maison","eau","corps","pere","mere","fils","femme",
    "groupe","partie","nombre","classe","ordre","forme","jeune","petit","nouveau","bon",
    "premier","force","famille","moment","idee","nature","fond","esprit","ami","heure",
    "travail","histoire","enfant","exemple","livre","route","table","long","gens","nuit",
  ],
  german: [
    "der","die","und","in","den","von","zu","das","mit","sich","des","auf","nicht","ein",
    "ist","auch","es","an","als","nach","wie","aus","noch","hat","nur","aber","bei","war",
    "dass","vor","oder","so","seine","wenn","da","alle","sehr","mehr","am","bis","mir",
    "kann","hier","gut","denn","uns","jetzt","unter","ganz","dann","schon","weil","viel",
    "lang","groß","klein","alt","jung","neu","hoch","weit","kurz","frei","klar","stark",
    "hand","haus","mann","frau","kind","zeit","welt","stadt","land","weg","tag","nacht",
    "wort","bild","platz","arbeit","leben","auge","kopf","name","wasser","buch","teil",
    "erde","punkt","feld","kraft","seite","grund","form","tisch","stuhl","raum","licht",
    "ordnung","klasse","gruppe","stimme","freund","stelle","schule","straße","beispiel",
  ],
  portuguese: [
    "de","que","e","o","a","do","da","em","um","para","com","no","na","os","se","por",
    "mais","as","dos","como","mas","foi","ao","ele","das","tem","seu","sua","ou","ser",
    "quando","muito","nos","ja","eu","bem","sem","ate","mesmo","entre","depois","tempo",
    "vida","casa","grande","mundo","dia","onde","ano","outro","ainda","cada","parte",
    "homem","ponto","lugar","agua","terra","nome","cidade","lado","mao","corpo","pai",
    "familia","noite","olho","poder","pessoa","hora","palavra","novo","bom","classe",
    "grupo","forma","ordem","exemplo","livro","mesa","forca","historia","momento","campo",
    "trabalho","rua","alto","longo","filho","mulher","jovem","pais","porta","cara","ideia",
  ],
  italian: [
    "di","che","e","la","il","un","a","per","in","non","una","sono","mi","si","lo","ho",
    "ma","ha","le","con","ti","cosa","se","io","come","da","ci","no","questo","bene",
    "qui","tutto","del","sei","suo","sua","nel","dei","degli","alla","dalla","nella",
    "tempo","vita","mondo","casa","uomo","donna","giorno","anno","parte","modo","punto",
    "mano","occhio","porta","terra","acqua","corpo","nome","padre","madre","figlio","citta",
    "notte","ora","strada","lavoro","storia","posto","fatto","gruppo","parola","classe",
    "ordine","esempio","libro","tavolo","grande","nuovo","buono","lungo","alto","giovane",
    "piccolo","primo","stesso","altro","solo","ogni","poco","molto","troppo","ancora",
  ],
  hindi: [
    "ka","ki","ko","ke","hai","se","me","ne","par","ye","wo","ho","na","tha","kya",
    "bhi","ek","aur","is","us","mera","tera","kuch","bahut","accha","bada","chhota",
    "naya","purana","lamba","paani","ghar","log","kaam","din","raat","naam","jagah",
    "duniya","desh","shehar","sadak","kitab","phal","phool","rang","mausam","dhoop",
    "barish","hawa","zameen","aasman","samay","sapna","khushi","dard","dost","rishta",
    "zindagi","safar","raasta","manzil","umeed","yaad","pyaar","sach","jhooth","himmat",
    "izzat","shabd","saahas","gyaan","buddhi","shakti","suraj","chand","taara","nadee",
    "pahad","jungle","maidan","dariya","sagar","aag","mitti","pathar","lakdi","loha",
  ],
}

export const languages = Object.keys(wordLists)

const punctuationMarks = [',', '.', '!', '?', ';', ':']

function addPunctuation(word) {
  if (Math.random() > 0.15) return word
  const mark = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)]
  return word + mark
}

function capitalizeFirst(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function generateWords(count = 200, { punctuation = false, numbers = false, language = 'english' } = {}) {
  const pool = wordLists[language] || wordLists.english
  const words = []
  let shouldCapitalize = false

  for (let i = 0; i < count; i++) {
    if (numbers && Math.random() < 0.1) {
      words.push(String(Math.floor(Math.random() * 1000)))
      continue
    }

    let word = pool[Math.floor(Math.random() * pool.length)]

    if (punctuation) {
      if (shouldCapitalize || i === 0) {
        word = capitalizeFirst(word)
        shouldCapitalize = false
      }
      word = addPunctuation(word)
      if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
        shouldCapitalize = true
      }
    }

    words.push(word)
  }
  return words
}
