import appstate from 'models/appstate/';

var getUtility = {

  createGetURL:function(params){
    // Get the size of an object
    var size = Object.size(params);
    var url = "" ;
    for(var i=0;i<size;i++)
    {
      var key = Object.getOwnPropertyNames(params)[i] ;
      var value = params[key] ;
      if(url=="")
      {
        url =  [key] +"=" + [value];
      }
      else{
        url = url + "&" + [key] +"=" + [value];
      }

    }

    return url;
}

}

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key))
    {
      size++;}
  }
  return size;
};




export default getUtility;
