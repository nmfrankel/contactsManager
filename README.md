# ContactManager
A simple intuitive interface to manage, modify & cleanup your contacts

How to run the manager
- Open ``index.html`` and follow the "import" prompt on the screen


__Advanced features__
- merge multiple files into one
- remove unwanted fields



## How to process a file(s) selection

1.	✔ Loop through each file
2.	✔ Seperate/Filter each contact into it's own array value
3.	✔ Loop through the 'temp' array and read each of the contacts values
4.	  Store that new singleContact onto the contacts JSON

## Features
-	merge multiple files into one -> no cloud for files to mysteriously be leaked on

## Features Coming soon
-	remove multiple of the same number in one contact
-	pre-fill area codes for 7 digit number and handle country code(+1) for iternational uses, i.e. TEL;CELL:2534630 -> TEL;CELL:7182534630
-	remove any fields or values, either one at a time in a uasable interface or automatically
-	append to existing data or clear all... when user tries to upload the second time and there's already data
-	define whether names are first, last and switch them to last, first
-	allow all these options to be done only to selected contacts
-	read & search through contacts efficiently
-	save & download the new modified file


### MILESTONES
✔	 --	parse every contact block with each field defined, i.e. from 'BEGIN:VCARD' untill 'END:VCARD'

	 --	store to a functional data type that can easily be searched later, i.e. JSON

	 --	append to an array of all the contacts (to improve search)