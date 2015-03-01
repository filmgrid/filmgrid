index='
db = db.getSiblingDB("appdb");
db.movies.ensureIndex(
    { title : "text",
     actors : "text" ,
     directors : "text" 
    },
    { 
    	default_language: "none",
      	name: "movies",
      	weights: {
     		title : 2,
     		actors : 1,
     		directors : 1
    	}
   }
);'
echo -e $index > index.js
mongo index.js