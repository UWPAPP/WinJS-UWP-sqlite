// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509

(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;
	var isFirstActivation = true;

	app.onactivated = function (args) {
	    
	    createDB();

		if (args.detail.kind === activation.ActivationKind.voiceCommand) {
			// TODO: Handle relevant ActivationKinds. For example, if your app can be started by voice commands,
			// this is a good place to decide whether to populate an input field or choose a different initial view.
		}
		else if (args.detail.kind === activation.ActivationKind.launch) {
			// A Launch activation happens when the user launches your app via the tile
			// or invokes a toast notification by clicking or tapping on the body.
			if (args.detail.arguments) {
				// TODO: If the app supports toasts, use this value from the toast payload to determine where in the app
				// to take the user in response to them invoking a toast notification.
			}
			else if (args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated) {
				// TODO: This application had been suspended and was then terminated to reclaim memory.
				// To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
				// Note: You may want to record the time when the app was last suspended and only restore state if they've returned after a short period.
			}
		}

		if (!args.detail.prelaunchActivated) {
			// TODO: If prelaunchActivated were true, it would mean the app was prelaunched in the background as an optimization.
			// In that case it would be suspended shortly thereafter.
			// Any long-running operations (like expensive network or disk I/O) or changes to user state which occur at launch
			// should be done here (to avoid doing them in the prelaunch case).
			// Alternatively, this work can be done in a resume or visibilitychanged handler.
		}

		if (isFirstActivation) {
			// TODO: The app was activated and had not been running. Do general startup initialization here.
			document.addEventListener("visibilitychange", onVisibilityChanged);
			args.setPromise(WinJS.UI.processAll());
		}

		isFirstActivation = false;
  
	};



	function onVisibilityChanged(args) {
		if (!document.hidden) {
			// TODO: The app just became visible. This may be a good time to refresh the view.
		}
	}

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};

	app.start();


	function createDB() {
	    // Create the request to open the database, named BookDB. If it doesn't exist, create it.
	    var database;

	    SQLite.Database.openDatabaseInFolderAsync(Windows.Storage.ApplicationData.current.roamingFolder, "BookDB.sqlite").then(
            function (openedOrCreatedDatabase) {
                database = openedOrCreatedDatabase;
                return SQLiteHelper.executeStatementsAsTransactionAsync(database, [
                    "CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY UNIQUE, title TEXT, authorid INTEGER);",
                    "CREATE TABLE IF NOT EXISTS authors (id INTEGER PRIMARY KEY UNIQUE, name TEXT);",
                    "CREATE TABLE IF NOT EXISTS checkout (id INTEGER PRIMARY KEY UNIQUE, status INTEGER);"
                ]);
            }).then(function () {
                if (SQLiteHelper.database) {
                    SQLiteHelper.database.close();
                    SQLiteHelper.database = null;
                }
                SQLiteHelper.database = database;
                database = null;


                //insert data
                insert();
            },
            function (err) {
                if (database) {
                    database.close();
                    database = null;
                }
                WinJS.log && WinJS.log("Database open failure: " + err, "sample", "error");
            });
	}

	function closeDB() {
	    if (SQLiteHelper.database) {
	        SQLiteHelper.database.close();
	        SQLiteHelper.database = null;
	    }
	}

	function deleteDB() {
	    if (SQLiteHelper.database) {
	        SQLiteHelper.database.close();
	        SQLiteHelper.database = null;
	    }

	    Windows.Storage.ApplicationData.current.roamingFolder.getFileAsync("BookDB.sqlite").then(function (dbFile) {
	        return dbFile.deleteAsync();
	    },
        function (err) {
            WinJS.log && WinJS.log("Database deletion failure: " + err, "sample", "error");
        });
	}

	function insert() {
	    var statements =[
	         {
	            statement: "INSERT OR REPLACE INTO checkout VALUES (?, ?);",
	            parameters: ["1", 333]
	         },
             {
                 statement: "INSERT OR REPLACE INTO checkout VALUES (?, ?);",
                 parameters: ["2", 334]
             },
             {
                 statement: "INSERT OR REPLACE INTO checkout VALUES (?, ?);",
                 parameters: ["3", 335]
             },
             {
                 statement: "INSERT OR REPLACE INTO checkout VALUES (?, ?);",
                 parameters: ["4", 336]
             },
             {
                 statement: "INSERT OR REPLACE INTO checkout VALUES (?, ?);",
                 parameters: ["5", 337]
             }
	    ]

	    return SQLiteHelper.bindAndExecuteStatementsAsTransactionAsync(SQLiteHelper.database, statements).then(function () {
	        search();
	    });
	}


    //search data
	function search() {
	    SQLiteHelper.executeStatementsAsTransactionAsync(SQLiteHelper.database, [
            "SELECT * FROM checkout ORDER BY status",
	    ]).then(function (datas) {
	        datas.forEach(function (dataRow) {
	            var book = {
	                id: parseInt(dataRow.getFirstValueByName("id")),
	                title: dataRow.getFirstValueByName("status"),
	            };
	        });

	        droptable();
	    })
	}

    //delete table
	function droptable() {
	    SQLiteHelper.executeStatementsAsTransactionAsync(SQLiteHelper.database, [
            "DROP TABLE books",
	    ]).then(function (datas) {
	       
	    })
	}

})();
