// define static vars
let loadingBar = document.getElementById('loading'),
msgEl = document.getElementById('msg'),
validExtention = ['vcf', 'csv'],
countEl = document.getElementById('count'),
contacts = []

// default settings variables


// start: for development
let rawContacts = '',
resultDiv = document.querySelector('section:last-of-type>.container'),
testData // set in the preceding fetch

fetch('./testing/doubleSpace.vcf')
	.then(res => res.text())
	.then(txt => {
		vCard.parse(txt)
		testData = txt
	})
	.catch(err => console.error(err))
// end: for development




// display a meesage to the user
function displayMsg(msg = 'No message defined', type = 'vis', dura = 3500){
	msgEl.innerText = msg
	msgEl.classList.add(type)

	setTimeout(() => {
		msgEl.classList.remove(type)
	}, dura)
}

// initial check of imported contacts file
async function loadFiles(reset = false){
	loadingBar.classList.add('running')
	resultDiv.innerText = 'Processing...'
	displayMsg('Processing...', 'vis', 1000)

	// on upload remove previously uploaded contacts
	if(reset)
		contacts = [],
		countEl.innerText = contacts.length,
		rawContacts = ''

	// check that a file is selected
	let files = document.getElementById('file').files
	if(files.length>0){
		// go through each contact
		await Promise.all([...files].map(async (file) => {

			// only allow vcf contact cards
			if(validExtention.indexOf(file.name.split('.').pop())<0){
				console.log('Unsupported file type')
				displayMsg('Unsupported file type', 'amber')
				return
			}

			// load and process file data
			await file.text().then(data => {
				// append this contact to main file
				rawContacts += data
				// convert vCard to JSON and append to 'contacts'
				vCard.parse(data).forEach(singleContact => {
					contacts.push(singleContact)
					// update how many contacts were loaded in
					countEl.innerText = contacts.length
				})
			})

		}))

		// resets upload button if no valid files were selected
		if(rawContacts=='') document.getElementById('file').value=''

		// check if doubles exist
		doubles.detect()

		// show merged results
		resultDiv.innerText = rawContacts
	}else{
		console.log('No files selected')
		displayMsg('No files selected', 'amber')
		resultDiv.innerText = reset? 'Upload a contact file': rawContacts
	}

	setTimeout(loadingBar.classList.remove('running'), 250)
}


// manage reading and creating vCards to be used for interface
class vCard{
	static parse(data = '') {

		// convert a vCard into an array where each item is a single contact
		let rawTemp = data.replace(/BEGIN:VCARD(?:\n|\s\s)/gi, '["')
		.replace(/VERSION:\d.?\d(?:\n|\s\s)/gi, '')
		.replace(/END:VCARD(?:\n|\s\s)?/gi, ']')
		.replace(/(\n|\s\s)(\s|=)(?!END)/gi, '')// handles photos and encoded notes
		.replace(/   ?/gi, ' ')
		.replace(/(?:\n|\s\s)(?=\w)/gi, '",\n')
		.replace(/(?:\n|\s\s)/gi, '"')
		.replace(/\]\[/gi, '],[')
		.replace(/\\/gi, '')
		let tempArr = JSON.parse(`[${rawTemp}]`)

		// loop through array of contacts and convert to array of js objects
		let tempContacts = []
		tempArr.forEach((single, i) => {
			tempContacts[i] = {}

			single.forEach(item => {
				let singleValue = ['N', 'FN', 'BDAY', 'NICKNAME', 'ROLE', 'TITLE', 'URL', 'NOTE']
				let skipValues = ['AGENT', 'GEO', 'MAILER', 'PRODID', 'REV', 'TZ', 'UID']
	
				let matched = item.match(/^([\w\d\.-]+);?(.*):(.*)/),
				property = matched[1].trim(),
				meta = matched[2].trim(),
				value = matched[3].trim()

				// save value to this contacts js object
				if(skipValues.indexOf(property) >= 0){
					return
				}else if(singleValue.indexOf(property) >= 0){
					tempContacts[i][property] = value
				}else{
					if(!tempContacts[i][property]) tempContacts[i][property] = []
					tempContacts[i][property].push({meta: meta, val: value})
				}
				// console.log(property, meta, `'${value}'`)
			});
		})
		
		// send back an array of contacts processed
		console.log(tempContacts)// for development
		return tempContacts
	}

	static generate(data = '') {
		// return 'FINISH vCard.generate()'
	}
}










// NOT IMPLEMENTED YET
// NOT IMPLEMENTED YET
// NOT IMPLEMENTED YET
// NOT IMPLEMENTED YET



// download modified contacts
function download(filename = false){
	displayMsg('Your contact file will download shortly', 'vis', 500)

	let exportData = 'data:text/csv;charset=utf-8,',
	link

	// load contacts
	exportData += vCard.generate() || ''

	// escape if file is empty
	if (exportData.length <= 28){
		displayMsg('An error occured while generating file', 'err')
		return
	}

	// set filename
	if(!filename) filename = `Contacts export - ${new Date().getTime().toString().substr(-6)}.vcf`

	// init download
	link = document.createElement('a')
	link.setAttribute('href', encodeURI(exportData))
	link.setAttribute('download', filename)
	// link.click()

	return 'Finish vCard.generate() to download data'
}

// generate a unique id
function uniqid(){
	function randNumSeg(){
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
	}
	return `${randNumSeg()+randNumSeg()}-${randNumSeg()}-${randNumSeg()}-${randNumSeg()}-${randNumSeg()+randNumSeg()+randNumSeg()}`
}

// detect, suggest and merge doubles, and delete duplicate info in a single card
class doubles{
	// pretty easy function name... guess
	static detect(){
		console.error('FINISH: doubles.detect()')
	}

	static merge(){
		console.error('FINISH: doubles.merge()')
	}
}

// Format phone number to (XXX) XXX-XXXX
function formatPhone(number){
	const tempNum = number.match(/\(?([2-9]\d{2})\)?[-. ]?(\d{0,3})?[-. ]?(\d{0,4})?$/);
	return tempNum && !isNaN(tempNum)? `(${tempNum[1]}) ${tempNum[2]}-${tempNum[3]}`: number
}

// easily read quoted-printable value
function decodeQP(str){
	return decodeURI(str.replace(/={1}/g, '%'))
}

// .replace(/(?<!http)s?:/g, "\":\"")// if turning contact directly into JSON