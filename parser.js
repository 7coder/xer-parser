//const express = require('express');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const LineByLineReader = require('line-by-line');


/******
Paste path to .xer file in pathToFile variable. Example 'file.xer'
******/
const pathToFile = 'LINK_TO_YOUR_XER_FILE';


//Read file line by line
const rl = new LineByLineReader(pathToFile);

// Connect to MongoDB

/*****
Paste link to MongoDB database in url variable
*****/
const url = 'mongodb://LINK_TO_YOUR_DATABASE';

rl.on('error', (err) => {
  if (err) return console.log(err.message);
});

MongoClient.connect(url, (err, db) => {
  if (err) return console.log('Unable to connect to MongoDB server');
  console.log('Connected to MongoDB server');

  //Initialization of variables
  let collectionTitle;
  let lineObj = {};
  let splittedLine;
  let lineArrayKeys = lineArrayValues = [];

  rl.on('line', (fileLine) => {

    //Split lines to array
    let lines = fileLine.split('\r\n');

    for ( let line of lines ){

      //Split lines to array elements
      splittedLine = line.split('\t');

      if ( splittedLine[0] === '%T'){

        collectionTitle = splittedLine[1];

        //Create collection with Title
        db.createCollection(collectionTitle, (err, result) => {
          if (err) return console.log(err.message);
          console.log('Collection ' , collectionTitle, ' is created' );
          rl.resume();
        });

        rl.pause();
      }  else if ( splittedLine[0] === '%F' ){

        //Add to array head names
        lineArrayKeys = splittedLine.slice(1);

      } else if ( splittedLine[0] === '%R' ) {

          //Add to array lines
          lineArrayValues = splittedLine.slice(1);

          // Clean Object
          lineObj = {};

          for ( let j = 0; j < lineArrayKeys.length; j++){
            lineObj[ lineArrayKeys[j] ] = lineArrayValues[j];
          };


          //Insert data to collection
          db.collection(collectionTitle).insertOne(lineObj, (err, result) => {
             if (err) return console.log(err.message);
             console.log('Success!');
             rl.resume();
          });

          rl.pause();
       };

    };

  });

  rl.on('end', () => {
    console.log('End File');
    db.close();
  });

});
