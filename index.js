// define static vars
let loadingBar = document.getElementById('loading'),
msgEl = document.getElementById('msg'),
fileType = ['vcf', 'csv'],
errOccured = 0,
countEl = document.getElementById('count'),
contactCount = 0,
contacts = [],
rawContacts = '',
resultDiv = document.querySelector('section:last-of-type>.container')


// for development
let testingData = ``
/* let testingData = `BEGIN:VCARD
VERSION:2.1
FN;CHARSET=utf-8:Nosson  Meir Frankel
N;Frankel;Nosson;Meir
N:Frankel;Nosson ;Meir;;
N;CHARSET=utf-8:Willner R  Ad
FN:Nosson  Meir Frankel
TEL;CELL:3121234321
TEL;HOME:718-253-9012
END:VCARD
`;*/
testingData = `BEGIN:VCARD
VERSION:2.1
FN;CHARSET=utf-8:Shlomo
N;CHARSET=utf-8:Shlomo
NOTE;CHARSET=utf-8:Best0chavrusah0ever
TEL;CELL:7321234321
TEL;HOME:7329871234
EMAIL;X-INTERNET:randomemail@gmail.com
ADR;WORK;PREF;CHARSET=utf-8:;;;Lakewood;;;
URL:urn:uuid:8901260895162302680-8901260895162302680125
END:VCARD
`

/* let finalData = [
	{
		Name: 'Frankel;Nosson;Meir;;',
		FullName: 'Nosson Meir Frankel',
		Tel: '+1 (231)-123-1223'
	}
] */


// display a meesage to the user
function displayMsg(msg = 'No message defined', type = 'vis', dura = 3500){
	msgEl.innerText = msg
	msgEl.classList.add(type)

	setTimeout(() => {
		msgEl.classList.remove(type)
	}, dura)
}

// initial check of imported contacts file
async function loadFiles(reset = true){
	loadingBar.classList.add('running')
	resultDiv.innerText = 'Processing...'
	displayMsg('Processing...', 'vis', 1000)
	if(reset){
		contactCount = 0
		countEl.innerHTML = `Contact count: <b>${contactCount}</b>`
		rawContacts = ''
		contacts = []
	}

	let files = document.getElementById('file').files
	// make sure file is selected
	if(files.length>0){
		// go through each contact
		for (let i = 0; i < files.length; i++) {
			// only allow vcf contact cards
			if(fileType.indexOf(files[i].name.split('.').pop())<0){
				console.log('Unsupported file type')
				displayMsg('Unsupported file type', 'amber')
				continue
			}
			// load and process file data
			await files[i].text().then(data => {
				// update how many contacts are being merged
				contactCount += data.match(/BEGIN:VCARD/gi).length
				countEl.innerHTML = `Contact count: <b>${contactCount}</b>`

				// append this contact to main file
				rawContacts += data
			})
		}
 
		// resets upload button if no valid files were selected
		if(rawContacts=='') document.getElementById('file').value=''

		// convert text to JSON
		contactsToJSON()

		// check if doubles exist
		eliminateDoubles()

		// show merged results
		resultDiv.innerText = rawContacts
	}else{
		console.log('No files selected')
		displayMsg('No files selected', 'amber')
		resultDiv.innerText = reset? 'Upload a contact file': rawContacts
	}

	setTimeout(loadingBar.classList.remove('running'), 250)
}

// converts .vcf contacts into JSON
function contactsToJSON(){
	// turn a single contact block into an array where each item is a single contact
	let rawTemp = rawContacts.replace(/BEGIN:VCARD(?:\n|\s\s)/gi, '["')
	// .replace(/VERSION:\d.?\d\n|CHARSET=utf-8:/gi, '')
	.replace(/VERSION:\d.?\d(?:\n|\s\s)/gi, '')
	.replace(/END:VCARD(?:\n|\s\s)?/gi, ']')
	.replace(/   ?/gi, ' ')
	.replace(/(?:PHOTO|NOTE)[\w\d\s;=:/+-]+(?=])/gi, '')// temp remove images from processing
	// .replace(/(?<=(PHOTO|NOTE)[\w\d\s;=:/+-]{0,})\n\s?/g, "")// converts notes or photos into one line
	.replace(/(?:\n|\s\s)(?=\w)/gi, '",\n')
	// .replace(/\=(?:\n|\s\s)\=/gi, '=')// fixes encoded notes
	.replace(/(?:\n|\s\s)/gi, '"')
	.replace(/\]\[/gi, '],[')
	// .replace(/(?<!http)s?:/g, "\":\"")// if turning contact directly into JSON

	// console.log(rawTemp);return// for development
	defineFields(JSON.parse(`[${rawTemp}]`))
}
// convert JSON contacts into .vcf
function contactsToVCF(){
	// change into promise

	console.log('FINISH: once contacts are converting to JSON')
	return
}

// takes array of contacts and reads fields and stores to JSON
function defineFields(tempArr){
	// loop through array and store values based on fields
	tempArr.forEach((single, index) => {
		let tempContact = {}

		single.forEach(item => {
			// let uuid = Math.floor(Math.random()*6231782)
			let matched = item.match(/^([\w\d]+)[;:](?:(.{0,}):)?(.{0,})/)// match "N:;" -> a valid empty name
			// console.log(matched? `Parsed -> Main: ${matched[1]}, Sub: ${matched[2]}, Value: ${matched[3]}`: `Error: ${item}`)// for development

			switch (matched[1]) {
				case 'N':
					tempContact.N = matched[3]
					break;
				case 'FN':
					tempContact.FN = matched[3]
					break;

				default:
					break;
			}
		});


		console.log(tempContact)
		// contacts.push(JSON.parse(tempContact))
	})
}

// pretty easy function name... guess
function eliminateDoubles(){
	
	console.error('FINISH: eliminateDoubles')
	return 
	contacts.forEach(element => {// try array.filter()
		console.log(element)
	});
}

// Format phone number to (XXX) XXX-XXXX
function formatPhone(number){
	const tempNum = number.match(/\(?([2-9]\d{2})\)?[-. ]?(\d{0,3})?[-. ]?(\d{0,4})?$/);
	return tempNum && !isNaN(tempNum)? `(${tempNum[1]}) ${tempNum[2]}-${tempNum[3]}`: number
}

// download modified contacts
function download(filename = false){
	let exportData = 'data:text/csv;charset=utf-8,',
	link

	// load contacts
	exportData += contactsToVCF() || ''

	// escape if no contacts were loaded
	if (exportData.length <= 28){
		displayMsg('An error occured while downloading contacts', 'err')
		return
	}

	// set filename
	if(!filename) filename = `Contacts export - ${new Date().getTime().toString().substr(-6)}.vcf`

	// init download
	link = document.createElement('a')
	link.setAttribute('href', encodeURI(exportData))
	link.setAttribute('download', filename)
	// link.click()

	return 'Finish contactsToVCF() to download data'
}
