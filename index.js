// define static vars
let validExtention = ['vcf', 'csv'],
countEl = document.getElementById('count'),
contacts = [],
contactsWindow = document.getElementById('contactsWindowBody'),
loadingBar = document.getElementById('loading'),
msgEl = document.getElementById('msg'),
popCount = 0,
overlay = document.getElementById('overlay')

// default settings variables


// start: for development
let rawContacts = '',
resultDiv = document.querySelector('#devFill'),
testData // set in the preceding fetch

fetch('./testing/doubles.vcf')
	.then(res => res.text())
	.then(vCardData => {
		console.log(vCard.parse(vCardData))
		testData = vCardData
	})
	.catch(err => console.error(err))
// end: for development




// display a meesage to the user
function displayMsg(msg = 'No message defined', type = 'vis', dura = 3500){
	popCount++
	msgEl.innerText = msg
	msgEl.classList.add(type)

	setTimeout(() => {
		popCount--
		msgEl.classList.remove(type)
		if(!popCount) msgEl.innerHTML = '&nbsp;'
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
		displayContacts()
	}else{
		console.log('No files selected')
		displayMsg('No files selected', 'amber')
		resultDiv.innerText = reset? 'Upload a contact file': rawContacts
	}

	setTimeout(loadingBar.classList.remove('running'), 250)
}


// manage reading and creating vCards to be used for interface
class vCard{
	// convert a vCard into an array where each item is a single contact
	static parse(data = ''){
		let rawTemp = data.replace(/BEGIN:VCARD(\n|\s\s)VERSION:\d\.\d(\n|\s\s)/gi, '["')
		.replace(/(\n|\s\s)?(\n|\s\s)END:VCARD(\n|\s\s)?/gi, '"],')
		.replace(/((\n|\s\s)(\s|=)|\\)(?!END)/gi, '')// handles photos and encoded notes
		.replace(/   ?/gi, ' ')
		.replace(/\n|\s\s(?!$)/gi, '","')
		.slice(0, -1)
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
					tempContacts[i][property].push({meta, value: formatPhone(value)})
				}
				// console.log(property, meta, `'${value}'`)
			});
		})
		
		// send back an array of contacts processed
		// console.log(tempContacts)// for development
		return tempContacts
	}

	static generate(data = '') {
		// return 'FINISH vCard.generate()'
		// return resultDiv.innerText
		return ''
	}
}












// change visible <section>
function changeActive(element, event){
	if (event) event.preventDefault();
	
	let sectionId = element.getAttribute('sectionId')
	// window.history.replaceState('', '', '/index?open='+sectionId)
	
	// check if clicked on selected option or options
	if(element.id=='active') return
	
	// check if selected option has a section
	if(document.getElementById(sectionId)){
		// take away active status
		document.getElementById('active').removeAttribute('id')
		if(document.getElementsByClassName('active')[0]) document.getElementsByClassName('active')[0].classList.remove('active')
		// set active status for new option
		element.id = 'active'
		document.getElementById(sectionId).classList.add('active')
	}else{
		// try to run a secondary function instead of a pop section
		switch (sectionId){
		case 'import':
			document.getElementById('file').click();
			break;
		case 'export':
			download()
			break;
		}
	}
}

// display a pop-up prompt
function displayPrompt(method, event){
	if (event) event.preventDefault();
	overlay.classList.add('active')

	switch (method){
		case 'settings':
			
			break;
		case 'help':
			
			break;

		default:
			return `displayPrompt(): ${method} is not a valid method`
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
		displayMsg('An error occured while generating contact file', 'err')
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
function formatPhone(number, autoAreaCode = '845'){
	// fill in area code if missinf
	if (number.length == 7) number = autoAreaCode + number

	const tempNum = number.match(/\(?([2-9]\d{2})\)?[-. ]?(\d{0,3})?[-. ]?(\d{0,4})?$/);
	return tempNum && !isNaN(tempNum[3])? `(${tempNum[1]}) ${tempNum[2]}-${tempNum[3]}`: number
}

// easily read quoted-printable value
function decodeQP(str){
	return decodeURI(str.replace(/={1}/g, '%'))
}

// loop through all contacts to display them
function displayContacts(options = null){
	// handle header change based on 'options'
	// handle header change based on 'options'

	contacts.forEach(single => {
		let newRow = document.createElement('div')
		newRow.classList.add('row')
		
		options = ['PHOTO', 'FN', 'TEL', 'EMAIL']
		options.forEach((item, index) => {
			let newCell = document.createElement('cell')
			newCell.classList.add('cell')
			if(index==0)
				newCell.classList.add('img'),
				newCell.innerText = single['N'].split(";")[1]? single['N'].split(";")[1].substr(0, 1): single['N'].substr(0, 1)
			if(single[item]) newCell.innerText = item != 'FN'? single[item][0].value: single[item]

			newRow.append(newCell)
		})

		contactsWindow.append(newRow)
	})


	/*<div class="row">
		<div class="cell img">N</div>
		<div class="cell">Nosson</div>
		<div class="cell">Frankel</div>
		<div class="cell">example@gmail.com</div>
		<div class="cell">7182534789</div>
	</div>*/
}

// .replace(/(?<!http)s?:/g, "\":\"")// if turning contact directly into JSON

// warn user they will loose their work when closing
window.onbeforeunload = function(){
	// return "By leaving the page you will loose all your work. Are you sure you want to leave?"
}