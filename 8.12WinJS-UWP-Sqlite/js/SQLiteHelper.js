
function runPromisesInSerial(promiseFunctions) {
    return promiseFunctions.reduce(function (promiseChain, nextPromiseFunction) {
        return promiseChain.then(nextPromiseFunction);
    },
    WinJS.Promise.wrap());
};


//begin execute transaction ,this method is invoked by following
function executeAsTransactionAsync(database, workItemAsyncFunction) {
    return database.executeAsync("BEGIN TRANSACTION").then(workItemAsyncFunction).then(
        function (result) {
            var successResult = result;
            return database.executeAsync("COMMIT").then(function () {
                return successResult;
            });
        },
        function (error) {
            var errorResult = error;
            return database.executeAsync("COMMIT").then(function () {
                throw errorResult;
            });
        });
};

//transcation : execute statements 
function executeStatementsAsTransactionAsync(database, statements) {
    //map the statements ,then bind the statement to database  ,return a statementpromisefunction
    var executeStatementPromiseFunctions = statements.map(function statementToPromiseFunction(statement) {
        return database.executeAsync.bind(database, statement);
    });

    //execute the statementpromisefunction 
    return executeAsTransactionAsync(database, function () {
        //run in serial
        return runPromisesInSerial(executeStatementPromiseFunctions);
    });
};


//transcation : binding statements content and execute statements
function bindAndExecuteStatementsAsTransactionAsync(database, statementsAndParameters) {
    var bindAndExecuteStatementPromiseFunctions = statementsAndParameters.map(function (statementAndParameter) {
        return database.bindAndExecuteAsync.bind(database, statementAndParameter.statement, statementAndParameter.parameters);
    });

    return executeAsTransactionAsync(database, function () {
        return runPromisesInSerial(bindAndExecuteStatementPromiseFunctions);
    });
};

//checked database is existed,if no, create a new
function checkDatabaseAsync(databaseFolder, databaseFileName) {
    return new WinJS.Promise(function (complete, error, progress) {
        databaseFolder = typeof databaseFolder !== 'undefined' ? databaseFolder : Windows.Storage.ApplicationData.current.localFolder;
        databaseFileName = typeof databaseFileName !== 'undefined' ? databaseFileName : "db.sqlite";
        if (SQLiteHelper.database) {
            complete(SQLiteHelper.database)
        } else {
            var database = SQLite.Database.openDatabaseInFolderAsync(databaseFolder, databaseFileName).then(
                    function (openedDatabase) {
                        SQLiteHelper.database = openedDatabase;
                        complete(SQLiteHelper.database);
                    });
            SQLiteHelper.database = database;
        };
    });
};

WinJS.Namespace.define("SQLiteHelper", {
    checkDatabaseAsync: checkDatabaseAsync,
    executeStatementsAsTransactionAsync: executeStatementsAsTransactionAsync,
    bindAndExecuteStatementsAsTransactionAsync: bindAndExecuteStatementsAsTransactionAsync,
    database:null,
})