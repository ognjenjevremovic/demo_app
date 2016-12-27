//  Require the modules
var logger      = require('../logger'),
    datter      = require('../datter');


//  Content Data Access Object Constructor
function ContentDAO(db) {

    'use strict';


    //  Check if the constructor is called improperly
    if((this instanceof ContentDAO) === false) {
        //  Return new instance of constructor
        return new ContentDAO(db);
    }


    //  Store the content database collection
    var contentCollection   = db.collection('content');



    //  Add new content (link)
    this.addNew         = function(params, callback) {

        //  Query document constructor
        function QueryDocument(user) {
            params._id  = user;
        }

        //  Content document constructor
        function ContentDocument(params) {
            this.originalUrl    = params.originalUrl;
            this.shortenUrl     = params.shortenUrl;
            this.description    = params.description;
            this.name           = params.name;
            this.created        = {
                timestamp   :   datter().timestamp,
                date        :   datter().date,
                time        :   datter().time
            };
        }


        //  Construct a query document
        function constructQueryDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Return a query document
                return resolve({
                    queryDocument   :   new QueryDocument(params.user),
                    contentParams   :   params
                });

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Find a matching content document
        function findMatchingDocuments(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Find one method callback
                var findOne_cb = function(err, result) {

                    //  Check if there was an error
                    if(err) {

                        //  Construct a friendly error message
                        var databaseQuery_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 122.",
                            message : "There was an error querying 'content' collection."
                        };
                        logger('error', databaseQuery_error);

                        //  Reject a promise with an error
                        return reject(databaseQuery_error);

                    }

                    //  Store the document found
                    var documentFound = result;

                    //  Return a document found
                    return resolve({
                        contentParams   :   params.contentParams,
                        listOfDocs      :   documentFound.contents,
                        user            :   documentFound._id
                    });

                };


                //  Find the matching document
                contentCollection.findOne(params.queryDocument, findOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Check if the document already exist in the array of docs
        function checkForDuplicates(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Itterate over the array of content documents
                params.listOfDocs.forEach(function(contentDoc) {

                    //  Check if the document with that shortenUrl already exist in the 'contents' field
                    if(contentDoc.shortenUrl === params.contentParams.shortenUrl) {

                        //  Construct a friendly warning
                        var documentAlreadyExist_warning = {
                            date    : datter().time + " " + datter().date,
                            message : "Document with that link already exists."
                        };

                        //  Resolve the promise with an error
                        return resolve({
                            warning     :   documentAlreadyExist_warning
                        });

                    //  Document (with that shortenUrl value [unique index]) does not exist
                    }

                    //  Return the content parameters
                    return resolve({
                        contentParams   :   params.contentParams,
                        user            :   params.user
                    });

                });

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Construct a new content document
        function constructContentDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Pass a content document
                return resolve({
                    newContentDocument  : new ContentDocument(params.contentParams),
                    user                : params.user
                });

            };


            //  Check if there was a warning (document already exists)
            if(params.warning) {

                //  Pass the warning
                return resolve({
                    warning     :   params.warning
                });

            }


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Add new document to content array
        function updateContentForTheUser(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Content document update callback
                var updateOne_cb = function(err, result) {

                    //  Check if there was an error
                    if(err) {

                        //  Construct a friendly error message
                        var updateContent_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 122.",
                            message : "There was an error updating the content array in the content collection."
                        };
                        logger('error', updateContent_error);

                        //  Reject a promise with an error
                        return reject(updateContent_error);

                    //  Database queried successful
                    }

                    //  Return a document found
                    return resolve({
                        documentInserted    :   params.contentDocument
                    });

                };

                //  Update document
                var updateDoc = {
                    $addToSet   : {
                        'contents'  :   params.newContentDocument
                    }
                };


                //  Find content document for the user
                contentCollection.updateOne(params.user, updateDoc, findOneAndModify_cb);

            };


            //  Check if there was a warning (document already exists)
            if(params.warning) {

                //  Pass the warning
                return resolve({
                    warning     :   params.warning
                });

            }


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(params) {
            return callback(null, params.warning, params.documentInserted);
        }


        //  Construct a query document
        constructQueryDocument(params)
            //  Find a matching content(s) document
            .then(findMatchingDocuments)
            //  Check if the document already exist as a subdocument
            .then(checkForDuplicates)
            //  Construct a new content document
            .then(constructContentDocument)
            //  Add new content document as the subdocument to the 'contents'
            .then(updateContentForTheUser)
            //  Pass the error/warning/userObject back to the callback
            .then(exit)
            //  Catch the error in the process (if any)
            .catch(function(error) {
                return callback(error, null, null);
            });

    };

    //  Find session in the collection
    this.findAll        = function(user, callback) {

        //  Query document constructor
        function QueryDocument(user) {
            this._id    =   user;
        }


        //  Construct a query document
        function constructQueryDocument(user) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Return a query document
                return resolve(new QueryDocument(user));

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Query the content collection
        function findContentForTheUser(queryDocument) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Find document callback
                var findOne_cb = function(err, result) {

                    //  Check if there was an errory querying the document
                    if(err) {

                        //  Construct a friendly error message
                        var databaseQuery_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 122.",
                            message : "There was an error querying the content collection."
                        };
                        logger('error', databaseQuery_error);

                        //  Reject a promise with an error
                        return reject(databaseQuery_error);

                    //  Content collection queried successfuly
                    }

                    //  Store the document found
                    var documentFound = result.ops[0];

                    //  Resolve the promise with a document found
                    return resolve(documentFound.contents);

                };


                //  Find all content by the user
                contentCollection.findOne(queryDocument, findOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/userObject back to the callback
        function exit(contents) {
            return callback(null, null, contents);
        }


        //  Construct a query document
        constructQueryDocument(user)
            //  Query the content collection for the content (by the user)
            .then(findContentForTheUser)
            //  Pass the error/warning/userObject back to the callback
            .then(exit)
            //  Catch the error in the process (if any)
            .catch(function(error) {
                return callback(error, null, null);
            });

    };

    //  Delete session from the collection
    this.removeOne      = function(params, callback) {

        //  Query document constructor
        function QueryDocument(user) {
            this._id    = user;
        }


        //  Construct a query document
        function constructQueryDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Return a query document
                return resolve({
                    queryDocument       :   new QueryDocument(params.user),
                    contentDocument     :   params.content
                });

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Remove the document matching the query
        function removeDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Remove document callback
                var findOneAndModify_cb = function(err, result) {

                    //  Check if the error occured in the process
                    if(err) {

                        //  Construct a friendly error message
                        var documentDelete_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 122.",
                            message : "There was an error hashing the password."
                        };
                        logger('error', documentDelete_error);

                        //  Reject the promise with an error
                        return reject(documentDelete_error);

                    //  Document deleted successfuly
                    }

                    //  Store the document deleted
                    var documentDeleted = result.value;

                    //  Return a document deleted
                    return resolve(documentDeleted);

                };

                //  Update document
                var updateDocument = {
                    $pull   : {
                        'contents'   : params.content
                    }
                };


                //  Remove the document from the content collection
                contentCollection.findOneAndModify(params.queryDocument, updateDocument, findOneAndModify_cb);

            };


            //  Return a new promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/documentDeleted to the callback
        function exit(documentDeleted) {
            return callback(null, null, documentDeleted);
        }


        //  Construct a query document
        constructQueryDocument(params)
            //  Remove the document matching the query
            .then(removeDocument)
            //  Pass the error/warning/documentDeleted to the callback
            .then(exit)
            //  Catch the error in the process (if any)
            .catch(function(error) {
                return callback(error, null, null);
            });

    };

    //  Update existing content
    this.updateOne      = function(params, callback) {

        //  Query document constructor
        function QueryDocument(user) {
            this._id    = user;
        }

        //  Document constructor
        function ContentDocument(oldContent, updatedContent) {
            this.originalUrl    = oldContent.originalUrl;
            this.shortenUrl     = oldContent.shortenUrl;
            this.name           = updatedContent.name;
            this.description    = updatedContent.description;
            this.created        = oldContent.created;
            this.updated        = {
                timestamp   :   datter().timestamp,
                date        :   datter().date,
                time        :   datter().time
            };
        }


        //  Construct the query document
        function constructQueryDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Return a query document
                return resolve({
                    queryDocument   :   new QueryDocument(params.user),
                    contentParams   :   params
                });

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Find a document matching the criteria
        function findMatchingDocuments(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Find document callback
                var findOne_cb = function(err, result) {

                    //  Check if there was an error querying the database
                    if(err) {

                        //  Construct the friendly error message
                        var databaseQuery_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 122.",
                            message : "There was an error querying the content collection."
                        };
                        logger('error', databaseQuery_error);

                        //  Reject a promise with an error
                        return reject(databaseQuery_error);

                    //  No errors querying the database
                    }

                    //  Store the document found
                    var documentFound = result.ops[0];

                    //  Resolve a promise with appropriate parameters
                    return resolve({
                        contentParams   :   params.contentParams,
                        listOfDocs      :   documentFound.contents,
                        user            :   documentFound._id
                    });

                };


                //  Find the matching document
                contentCollection.findOne(queryDocument, findOne_cb);

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Find the matching content document to update
        function findMatchingContentDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Itterate over the documents array
                params.listOfDocs.forEach(function(contentDoc, index, listOfDocs) {

                    //  Find the right document by the shortenUrl (unique per subdocument)
                    if(contentDoc.shortenUrl === params.contentParams.shortenUrl) {

                        //  Remove the matching document from the list of documents
                        var oldDocument = listOfDocs.splice(index, 1);

                        //  Resolve the promise with appropriate parameters
                        return resolve({
                            oldDocument     :   oldDocument,
                            contentParams   :   params.contentParams,
                            user            :   params.user
                        });

                    //  Content document not find (should NOT occur?!)
                    }

                    //  Construct a friendly error message
                    var documentNotFound_warning = {
                        date    : datter().time + " " + datter().date,
                        message : "No content document found."
                    };

                    //  Resolve the promise with an error
                    return resolve({
                        warning     :   documentNotFound_warning
                    });


                });

            };


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Construct content document
        function constructContentDocument(params) {

            //  Promise callback
            var promise_cb = function(resolve) {

                //  Resolve the promise with appropriate parameters
                return resolve({
                    newContentDocument  :   new ContentDocument(params.oldDocument, params.contentParams),
                    user                :   params.user
                });

            };


            //  Check if there was a warning (document already exists)
            if(params.warning) {

                //  Pass the warning
                return resolve({
                    warning     :   params.warning
                });

            }


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Update contents for the user
        function updateContentForTheUser(params) {

            //  Promise callback
            var promise_cb = function(resolve, reject) {

                //  Content document update callback
                var updateOne_cb = function(err) {

                    //  Check if there was an error
                    if(err) {

                        //  Construct a friendly error message
                        var updatingDocument_error = {
                            date    : datter().time + " " + datter().date,
                            stack   : "ERRROR! \nfile: " + __dirname + ", line 122.",
                            message : "There was an error updating the content array in the content collection."
                        };
                        logger('error', updatingDocument_error);

                        //  Reject a promise with an error
                        return reject(updatingDocument_error);

                    //  Document successfuly updated
                    }

                    //  Resolve the promise with a document updated
                    return resolve({
                        documentUpdated     : params.newContentDocument
                    });

                };

                //  Update document
                var updateDoc = {
                    $addToSet   : {
                        'contents'  :   params.newContentDocument
                    }
                };


                //  Update the contents array of subdocuments
                contentCollection.updateOne(params.user, updateDoc, updateOne_cb);

            };


            //  Check if there was a warning (document already exists)
            if(params.warning) {

                //  Pass the warning
                return resolve({
                    warning     :   params.warning
                });

            }


            //  Return a promise
            return new Promise(promise_cb);

        }

        //  Pass the error/warning/contentUpdated to the callback
        function exit(params) {
            return callback(null, params.warning, params.documentUpdated);
        }


        //  Construct the query document
        constructQueryDocument(params)
            //  Find a document matching the criteria (all content by the user)
            .then(findMatchingDocuments)
            //  Find the matching content document to update
            .then(findMatchingContentDocument)
            //  Construct new content document to replace the existing one
            .then(constructContentDocument)
            //  Update contents for the user
            .then(updateContentForTheUser)
            //  Pass the error/warning/contentUpdated to the callback
            .then(exit)
            //  Catch error in the process (if any)
            .catch(function(error) {
                return callback(error, null, null);
            });

    };

}


//  Export the module
module.exports = ContentDAO;
