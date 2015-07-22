/*global require*/
/*
 * Bootstrap and angular-based mashup
 * @owner Erik Wetterberg (ewg)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};

require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {
	//qlik app
	var app;
	//data for case listing
	var data = {
		headers: [],
		rows: []
	};

	function getQlikApp () {
		//return qlik.openApp( "4bf04442-aa89-43ff-870a-917c86c92990", config )
		return qlik.openApp( "Helpdesk Management.qvf", config )
	}

	//callbacks -- inserted here --
	function setCases ( reply, app ) {
		data.headers.length = 0;
		data.rows.length = 0;
		//set headers
		reply.qHyperCube.qDimensionInfo.forEach( function ( dim ) {
			data.headers.push( dim.qFallbackTitle );
		} );
		reply.qHyperCube.qMeasureInfo.forEach( function ( mea ) {
			data.headers.push( mea.qFallbackTitle );
		} );
		reply.qHyperCube.qDataPages.forEach( function ( page ) {
			page.qMatrix.forEach( function ( row ) {
				data.rows.push( row );
			} );
		} );
	}

	//
	// Defining Module
	//
	var helpdeskApp = angular.module( "helpdeskApp", ['ngRoute'] );
	//
	// Defining Routes
	//
	helpdeskApp.config( function ( $routeProvider ) {
		$routeProvider.when( '/cases', {
			templateUrl: 'cases.html',
			controller: 'CaseCtrl'
		} ).
			otherwise( {
				controller: 'MainCtrl',
				templateUrl: './main.html'
			} );
	} );
	//controllers
	helpdeskApp.controller( "MainCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}
		//get objects -- inserted here --
		app.getObject( 'QV00', 'CurrentSelections' );
		app.getObject( 'QV01', 'hRZaKk' );
		app.getObject( 'QV02', 'xfvKMP' );
		app.getObject( 'QV03', 'a5e0f12c-38f5-4da9-8f3f-0e4566b28398' );
		app.getObject( 'QV04', 'PAppmU' );
	}] );
	helpdeskApp.controller( "CaseCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}
		app.createCube( {
			"qInitialDataFetch": [
				{
					"qHeight": 400,
					"qWidth": 8
				}
			],
			"qDimensions": [
				{
					"qDef": {"qFieldDefs": ["CaseNumber"]}
				},
				{
					"qDef": {"qFieldDefs": ["Status"]}
				},
				{
					"qDef": {"qFieldDefs": ["Priority"]}
				},
				{
					"qDef": {"qFieldDefs": ["Case Created Date"]}
				},
				{
					"qDef": {"qFieldDefs": ["Case Closed Date"]}
				},
				{
					"qDef": {"qFieldDefs": ["Case Duration Time"]}
				},
				{
					"qDef": {"qFieldDefs": ["Case Owner"]}
				},
				{
					"qDef": {"qFieldDefs": ["Subject"]}
				}
			],
			"qMeasures": [],
			"qSuppressZero": false,
			"qSuppressMissing": false,
			"qMode": "S"
		}, setCases );
		//set up scope headers and rows
		$scope.headers = data.headers;
		$scope.rows = data.rows;

	}] );
	// bootstrap my angular application, including the "qlik-angular" module
	// must be done before the Qlik Sense API is used
	// you must also set qva-bootstrap="false" in your html file
	angular.bootstrap( document, ["helpdeskApp", "qlik-angular"] );
	qlik.setOnError( function ( error ) {
		//TODO:bootstrap removes html elements on dismiss..should hide instead
		$( "#errmsg" ).html( error.message ).parent().show();
	} );

	//

} );