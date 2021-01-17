// define static vars
let loadingBar = document.getElementById('loading'),
msgEl = document.getElementById('msg'),
validExtention = ['vcf', 'csv'],
errOccured = 0,
countEl = document.getElementById('count'),
contactCount = 0,
contacts = []

// start: for development
let rawContacts = '',
resultDiv = document.querySelector('section:last-of-type>.container'),
testData // set in the preceding fetch

/* fetch('./testing/doubleSpace.vcf')
	.then(res => res.text())
	.then(txt => testData = txt)
	.catch(err => console.error(err)) */
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
async function loadFiles(reset = true){
	loadingBar.classList.add('running')
	resultDiv.innerText = 'Processing...'
	displayMsg('Processing...', 'vis', 1000)
	if(reset){
		contactCount = 0
		countEl.innerText = contactCount
		rawContacts = ''
		contacts = []
	}

	let files = document.getElementById('file').files
	// make sure file is selected
	if(files.length>0){
		// go through each contact
		for (let i = 0; i < files.length; i++) {
			// only allow vcf contact cards
			if(validExtention.indexOf(files[i].name.split('.').pop())<0){
				console.log('Unsupported file type')
				displayMsg('Unsupported file type', 'amber')
				continue
			}
			// load and process file data
			await files[i].text().then(data => {
				// update how many contacts are being merged
				contactCount += data.match(/BEGIN:VCARD/gi).length
				countEl.innerText = contactCount

				// append this contact to main file
				rawContacts += data
			})
		}
 
		// resets upload button if no valid files were selected
		if(rawContacts=='') document.getElementById('file').value=''

		// convert text to JSON
		vCard.parse(rawContacts)

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


class vCard{
	static parse(data = '') {


// take input 'data' split each card into json then loop and split
// then return one big json array of all the contacts



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

		console.log(rawTemp)
		let tempArr = JSON.parse(`[${rawTemp}]`)

		// send to outer function while testing
		defineFields(tempArr)
	}

	static generate(data = '') {
		// return 'FINISH vCard.generate()'
	}
}












// takes array of contacts and reads fields and stores to JSON
function defineFields(tempArr){
	// loop through array and store values based on fields
	tempArr.forEach((single, index) => {
		let tempContact = {}

		single.forEach(item => {

			let test = item.match(/^([\w-]+)[;:]([\w\d=-]{0,})?[;:]?(.{0,})/gi)
			// ^([\w-]+)[;:]([\w\d=-]{0,})?[;:]?(.{0,})
			console.log(test)


			let singleValue = ['N', 'FN']
			// let property = item.match(/^([\w-]+)[;:]/)[1]

			// let matched = item.match(/^([\w-]+)[;:]([\w\d=-]{0,})?[;:]?(.{0,})/g)
			/* if(singleValue.indexOf(matched[1])>=0){
				tempContact[matched[1]] = matched[3].trim()
				// tempContact[matched[1]] = {meta: matched[2], val: matched[3]}
			}else{
				tempContact[matched[1]] = {meta: matched[2].trim(), val: matched[3].trim()}
			} */

			// console.log(matched? `Parsed -> Main: ${matched[1]}, Sub: ${matched[2]}, Value: ${matched[3]}`: `Error: ${item}`)// for development
		});

		// console.log(tempContact)
		// contacts.push(JSON.parse(tempContact))
	})
}





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

















// NOT IMPLEMENTED YET
// NOT IMPLEMENTED YET
// NOT IMPLEMENTED YET
// NOT IMPLEMENTED YET




// generate a unique id
function uniqid(){
	function randNumSeg(){
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
	}
	return `${randNumSeg()+randNumSeg()}-${randNumSeg()}-${randNumSeg()}-${randNumSeg()}-${randNumSeg()+randNumSeg()+randNumSeg()}`
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

// .replace(/(?<!http)s?:/g, "\":\"")// if turning contact directly into JSON