//Global variables
var showPanel = false;
var showContextMenu = true;
var one_click = false;
var enablePageAction = true;
var askBeforehide = true;

function getPrefs(prefs){
	showPanel = prefs['display.showPanel'];
	showContextMenu = prefs['display.showContextMenu'];
	one_click = prefs['display.one_click'];
	enablePageAction = prefs['pageAction.enabled'];
	askBeforehide = prefs['pageAction.askBeforeHide'];
}

function updatePref(event) {	
	var target=event.target;
	var pref=target.getAttribute('name');	
	switch (target.nodeName){
	case 'SELECT':
		prefs[pref]=target.value;
		break;
	case 'INPUT':
		switch(target.type){
			case 'checkbox': 
				prefs[pref]=target.checked;
				break;
			case 'radio':				
			case 'text':
				prefs[pref]=target.value;		
		}
		break;
	
	default: 
	}
}

function loadPref(e){
	var pref=e.getAttribute('name');	
	switch(e.nodeName) {
		case 'SELECT':
			e.value=prefs[pref];
			break;
		case 'INPUT':
			switch(e.type){
				case 'text':
					e.value = prefs[pref];
					break;
				case 'checkbox':					
					e.checked = prefs[pref] ? true : false;
					break;
				case 'radio':
					e.checked = (e.value == prefs[pref]);
					break;
			}
		default:
			break;
	}	
	//Binding DOM event
	e.addEventListener('click', updatePref);
}

function InitPage () {
	var e = document.querySelector('#download_bar_id');
	loadPref(e);
		
	var e = document.querySelector('#context_menu_id');
	loadPref(e);
	
	var e = document.querySelector('#one_click_id');
	loadPref(e);	
}

function OnOk () {	
 	window.close();
}

function OnCancel () {
  	window.close();
}

//Add event listenner:
document.addEventListener('DOMContentLoaded', InitPage);
document.querySelector('#buttonSave').addEventListener('click', OnOk);
document.querySelector('#buttonCancel').addEventListener('click', OnCancel);
