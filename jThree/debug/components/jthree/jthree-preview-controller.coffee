class JThreePreviewController
  @loadedScriptCount = 0;

  @initJThree:(config,codeKey)->
   window.j3 =
     lateLoad:true
   JThreePreviewController.loadj3Script config,codeKey,()->
     JThreePreviewController.checkFinalize config,codeKey
     for v in config.codes[codeKey].js
       JThreePreviewController.loadjsScript config,config.config.root+v,()->
         JThreePreviewController.checkFinalize config,codeKey

  @loadj3Script:(config,codeKey,finished)->
    j3Tag = document.createElement('script');
    if codeKey?
      j3Tag.setAttribute('x-goml',config.config.root+config.codes[codeKey].goml);
    else
      for k,v of config.codes
        j3Tag.setAttribute('x-goml',v.goml)
        break
    j3Tag.setAttribute('type','text/javascript');
    j3Tag.setAttribute 'src',config.config.j3
    j3Tag.setAttribute 'id','j3core'
    j3Tag.onload = ()->
      finished();
    document.body.appendChild j3Tag

  @loadjsScript:(config,url,finished)->
    jsTag = document.createElement 'script'
    jsTag.setAttribute 'type','text/javascript'
    jsTag.setAttribute 'src',url
    jsTag.onload = ()->
      finished()
    document.body.appendChild jsTag

  @checkFinalize:(config,codeKey)->
    JThreePreviewController.loadedScriptCount++
    if JThreePreviewController.loadedScriptCount == config.codes[codeKey].js.length+1
      console.error "start!"
      window.j3.lateStart();

module.exports = JThreePreviewController;
