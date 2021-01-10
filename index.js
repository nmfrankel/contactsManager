// define static vars
let loadingBar = document.getElementById('loading')
fileType = ['vcf'],
// contacts = [],
contacts = '',
resultDiv = document.querySelector('section:last-of-type>.container')


// initial check of imported contacts file
async function initialCheck(){
	loadingBar.classList.add('running')
	resultDiv.innerText = 'Processing...';
	contacts = ''

	let files = document.getElementById('file').files
	// make sure file is selected
	if(files.length>0){
		// go through each contact
		for (let i = 0; i < files.length; i++) {
			// only allow vcf contact cards
			if(fileType.indexOf(files[i].name.split('.').pop())<0) continue;
			
			// update how many contacts are being merged
			document.getElementById('count').innerHTML = `Contact count: <b>${i}</b>`
			// get file data
			await files[i].text().then(data => parseContact(data))
		}

		// check if doubles exist
		// eliminateDoubles();// disabled till implemented

		// show merged results
		resultDiv.innerText = contacts
	}else{
		resultDiv.innerText = 'No files selected.'
	}

	setTimeout(loadingBar.classList.remove('running'), 250);
}

// temp
let testingData = `BEGIN:VCARD
VERSION:2.1
FN;CHARSET=utf-8:Frankel Nosson Meir
N;CHARSET=utf-8:Frankel Nosson Meir
TEL;CELL:2341231234
END:VCARD
`;
/* let finalData = [
	{
		Name: 'Frankel;Nosson;Meir;;',
		FullName: 'Nosson Meir Frankel',
		Tel: '1231-123-1223'
	}
] */
function parseContact(data){
/* START: OG working */
	// append this contact to main file
	contacts += data
/* END: OG working */


	// turn a single contact block into an array where each item is a single contact
	data = data.replace(/BEGIN:VCARD(?:\n|\s\s)/gi, '["')
		// .replace(/VERSION:\d.?\d\n|CHARSET=utf-8:/gi, '')
		.replace(/VERSION:\d.?\d(?:\n|\s\s)/gi, '')
		.replace(/END:VCARD(?:\n|\s\s)?/gi, ']')
		.replace(/(?:\n|\s\s)(?=\w)/gi, '",\n')
		.replace(/(?<=(PHOTO|NOTE)[\w\d\s;=:/+-]{0,})\n\s?/g, "")
		.replace(/(?:\n|\s\s)/gi, '"')
		.replace(/\]\[/gi, '],[')
		// .replace(/(?<!http)s?:/g, "\":\"")

		// console.log(data)// for development
		data = JSON.parse(data)
		// console.log(data)// for development

	// lookout if newline contains a key:value \\
	// lookout if newline contains a key:value \\

	// loop through each item -> one contact
	data.forEach(item => {
		// let sContact= {};
		let temp = item.match(/^([\w\W]+);([\w\W]{0,}):([\w\W]{0,})/)// match "N:;" -> a valid empty name
		console.log(temp? `Parsed -> Main: ${temp[1]}, Sub: ${temp[2]}, Value: ${temp[3]}`: `Error: ${item}`)// for development
	});
}
parseContact(testingData);

/*
DONE --	parse every contact block, i.e. from 'BEGIN:VCARD' untill 'END:VCARD'

	 --	store to a functional data type that can easily be searched

	 --	append to an array of all the contacts (to improve search)
*/

// Format phone number to (XXX) XXX-XXXX
function formatPhone(number){
	const tempNum = number.match(/\(?([2-9]\d{2})\)?[-. ]?(\d{0,3})?[-. ]?(\d{0,4})?$/);
	return tempNum && !isNaN(tempNum)? `(${tempNum[1]}) ${tempNum[2]}-${tempNum[3]}`: number
}

// pretty easy description... guess
function eliminateDoubles(){
	contacts.forEach(element => {
		console.log(element)
	});
}
