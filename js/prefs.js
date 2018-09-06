//Global object
var PREFIX = "URLHelper.prefs";
var PREFS = {};
prefs = function(name,defaultValue){
	if (typeof name != 'string')
		throw "name is not of type string";
	
	//Update object fields	
	PREFS[name]=defaultValue;	
	
	//For persistence storage
	prefs.__defineGetter__(name,function(){
		var result=localStorage[PREFIX+name];
		if (result == null){
			result = PREFS[name];
			if (typeof result == 'object')
				return JSON.parse(JSON.stringify(result)); // clone
			return result;
		}
		if (result.indexOf('json://') == 0){
			result=JSON.parse(result.substring(7));
			return result
		}
		if (typeof result == 'string'){
			if (result == 'false')
				return false;
			else if (result == 'true')
				return true;
			if (typeof parseInt(result) != 'number' && result !='NaN')
				return result;
			else if (parseInt(result) == result)
				return parseInt(result);
			else if (parseFloat(result) == result)
				return parseFloat(result);
		}			
		return result;
	});
	
	prefs.__defineSetter__(name,function(val){
		var defaultValue=PREFS[name];
		var _name=PREFIX+name;
		if (typeof val == 'object'){
			var _val=JSON.stringify(val);
			/*
			if (JSON.stringify(defaultValue) == _val)
				delete localStorage[_name]	
			else
			*/
				localStorage[_name]='json://'+_val;
		}else if (defaultValue == val && localStorage[_name] != null) // the != null to avoid raising storage event handler
			delete localStorage[_name];
		else
			localStorage[_name]=val;				
	});
};
	
//Init some value	
// display
prefs('display.showPanel',true);
prefs('display.showContextMenu',true);
prefs('display.one_click',false);
// page action
prefs('pageAction.enabled',true);
prefs('pageAction.askBeforeHide',true);