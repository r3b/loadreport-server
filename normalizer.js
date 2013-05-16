var phelper=require('./helpers/phantomHelper.js');
phelper.getUnnormalizedReportList(null, function(err, docs){
  if(err)return console.error(err);
  console.dir(docs)
  docs.forEach(function(doc){
    //console.dir(doc);
    console.log('updating %s.',doc.id)
    phelper.updateSavedReport(doc.id,function(err, doc){
      if(err)return console.error(err);
      console.log('finished %s.',doc.id)
    })
  })
})