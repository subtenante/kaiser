/**
 * Created by Roy on 12/08/2016.
 */

// core modules
var util          = require('util');

// npm modules
var chai             = require('chai'),
	chai_things      = require('chai-things'),
	sinon            = require('sinon'),
	URI              = require('urijs');

var uriIsStub = sinon.stub(URI.prototype, 'is');

// lib modules
require('./spec_helper');

var helpers          = require('../lib/helpers'),
	kaiser           = require('../index'),
	Crawler          = require('../lib/crawler'),
	Resource         = require('../lib/resource'),
	PolicyChecker    = require('../lib/policy_checker');

var Transformer      = kaiser.Transformer,
	BasicTransformer = kaiser.BasicTransformer;

chai.should();
chai.use(chai_things);

describe('BasicTransformer', function() {
	describe('BasicTransformer()', function () {
		before(function () {
			this.validate = function (crawler, options,
			                          expectedCrawler, expectedOptions) {
				new BasicTransformer(crawler, options);

				sinon.assert.calledOnce(BasicTransformer.init);
				sinon.assert.calledWithExactly(BasicTransformer.init, expectedCrawler, expectedOptions);
			};
		});
		beforeEach(function () {
			this.sinon.stub(BasicTransformer, 'init');
		});
		it('should construct BasicTransformer instance successfully', function () {
			// Object set-up
			var crawler = 'crawler';
			var options = 'options';

			// Expected arguments to be passed to BasicDiscoverer.init
			const expectedCrawler = crawler;
			const expectedOptions = options;

			// Validation
			this.validate(crawler, options,
				expectedCrawler, expectedOptions);
		});
	});
	describe('.init()', function() {
		before(function() {
			this.validate = function(basicTransformer, crawler, options,
			                         expectedCrawler, expectedRewriteLinksFileTypes) {
				BasicTransformer.init.call(basicTransformer, crawler, options);

				sinon.assert.calledOnce(BasicTransformer.init);
				sinon.assert.calledWithExactly(BasicTransformer.init, crawler, options);
				sinon.assert.calledOnce(Transformer.init);
				sinon.assert.calledWithExactly(Transformer.init, expectedCrawler);
				basicTransformer.should.have.property('policyChecker').and.to.be.instanceof(PolicyChecker).and.to.have.property('crawler', crawler);
				basicTransformer.should.have.property('rewriteLinksFileTypes', expectedRewriteLinksFileTypes);
			};
		});
		beforeEach(function() {
			this.sinon.spy(BasicTransformer, 'init');
			this.sinon.spy(Transformer, 'init'); // Not a stub because we want Transformer.init() to initialize self.crawler to pass it to self.policyChecker
		});
		it('should initialize BasicTransformer instance with default parameters', function() {
			// Object set-up
			var basicTransformer = {};

			// Input arguments
			var crawler = 'crawler';
			var options = { rewriteLinksFileTypes: 'rewriteLinksFileTypes' };

			// Expected arguments to be passed to Discoverer.init
			const expectedCrawler = crawler;
			const expectedRewriteLinksFileTypes = 'rewriteLinksFileTypes';

			// Validation
			this.validate(basicTransformer, crawler, options,
				expectedCrawler, expectedRewriteLinksFileTypes);
		});
		it('should initialize BasicTransformer instance with default parameters and then fails to initialze the parameters again', function() {
			// Object set-up
			var basicTransformer = {};

			// Input arguments
			var crawler = 'crawler';
			var options = { rewriteLinksFileTypes: 'rewriteLinksFileTypes' };

			// Expected arguments to be passed to Discoverer.init
			const expectedCrawler = crawler;
			const expectedRewriteLinksFileTypes = 'rewriteLinksFileTypes';

			// Validation
			this.validate(basicTransformer, crawler, options,
				expectedCrawler, expectedRewriteLinksFileTypes);

			// Specific validation pre-conditions
			BasicTransformer.init.call(basicTransformer, crawler, options);

			// Specific validation
			sinon.assert.calledTwice(BasicTransformer.init);
			sinon.assert.calledWithExactly(BasicTransformer.init, crawler, options);
			sinon.assert.calledTwice(Transformer.init);
			sinon.assert.calledWithExactly(Transformer.init, expectedCrawler);
			basicTransformer.should.have.property('policyChecker').and.to.be.instanceof(PolicyChecker).and.to.have.property('crawler', crawler);
			basicTransformer.should.have.property('rewriteLinksFileTypes', expectedRewriteLinksFileTypes);
		});
	});
	describe('#logic()', function() {
		before(function () {
			this.validate = function (basicTransformer, resource, callback,
			                          expectedError, expectedResource) {
				basicTransformer.logic(resource, callback);

				sinon.assert.calledOnce(BasicTransformer.prototype.logic);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.logic, resource, callback);
				sinon.assert.calledOnce(callback);
				sinon.assert.calledWithExactly(callback, expectedError, expectedResource);
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'logic');
		});
		it('should fail to transform a resource because it can\'t be transformed', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var callback = this.sinon.spy();

			// Expected arguments to be passed to the callback
			const expectedError = null;
			const expectedResource = resource;

			// Spies, Stubs, Mocks
			this.sinon.stub(BasicTransformer.prototype, 'canTransform').returns(false);

			// Validation
			this.validate(basicTransformer, resource, callback,
				expectedError, expectedResource);
		});
		it('should transform a resource sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var callback = this.sinon.spy();

			// Expected arguments to be passed to the callback
			const expectedError = null;
			const expectedResource = resource;

			// Spies, Stubs, Mocks
			this.sinon.stub(BasicTransformer.prototype, 'canTransform').returns(true);
			this.sinon.stub(BasicTransformer.prototype, 'populateUriArrays').returns();
			this.sinon.stub(BasicTransformer.prototype, 'replaceResourceContent').returns();

			// Validation
			this.validate(basicTransformer, resource, callback,
				expectedError, expectedResource);
		});
	});
	describe('#canTransform()', function() {
		before(function () {
			this.validate = function (basicTransformer, resource, expectedReturnValue) {
				basicTransformer.canTransform(resource);

				sinon.assert.calledOnce(BasicTransformer.prototype.canTransform);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.canTransform, resource);
				BasicTransformer.prototype.canTransform.returned(expectedReturnValue);
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'canTransform');
			this.helpersIsEmptyStub = this.sinon.stub(helpers, 'isEmpty');
		});
		it('should allow a resource with no file in the url to be transformed', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {
				rewriteLinksFileTypes: [
					'txt'
				]
			});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);

			// Expected return value by canTransform()
			const expectedReturnValue = true;

			// Spies, Stubs, Mocks
			this.sinon.stub(PolicyChecker.prototype, 'isDepthAllowed').returns(true);
			this.helpersIsEmptyStub.returns(true);

			// Validation
			this.validate(basicTransformer, resource, expectedReturnValue);
		});
		it('should allow a resource with file in the url to be transformed', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {
				rewriteLinksFileTypes: [
					'txt'
				]
			});

			// Input arguments
			var resource = Resource.instance('https://www.google.com/file.txt', null);

			// Expected return value by canTransform()
			const expectedReturnValue = true;

			// Spies, Stubs, Mocks
			this.sinon.stub(PolicyChecker.prototype, 'isDepthAllowed').returns(true);
			this.helpersIsEmptyStub.returns(false);

			// Validation
			this.validate(basicTransformer, resource, expectedReturnValue);
		});
	});
	describe('#populateUriArrays()', function() {
		before(function () {
			this.validate = function (basicTransformer, resource, fetchedUris, notFetchedUris,
			                          expectedFetchedUris, expectedNotFetchedUris) {
				basicTransformer.populateUriArrays(resource, fetchedUris, notFetchedUris);

				sinon.assert.calledOnce(BasicTransformer.prototype.populateUriArrays);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.populateUriArrays, resource, fetchedUris, notFetchedUris);
				fetchedUris.should.be.deep.equal(expectedFetchedUris);
				notFetchedUris.should.be.deep.equal(expectedNotFetchedUris);
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'populateUriArrays');
			this.helpersIsEmptyStub = this.sinon.stub(helpers, 'isEmpty');
		});
		it('should populate fetchedUris array', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var fetchedUris = [];
			var notFetchedUris = [];

			// Expected values
			var urisDictionaryToReturnFromStub = [];
			var regex = /(\s(?:src|href)\s*=\s*["']?\s*)([^"'>]+)(\s*["']?[^>]*>)/ig;
			urisDictionaryToReturnFromStub[regex] = [];
			var match = ' src="www.exmaple.com" >';
			urisDictionaryToReturnFromStub[regex][match] = [];
			urisDictionaryToReturnFromStub[regex][match].push(' src="');
			urisDictionaryToReturnFromStub[regex][match].push('www.exmaple.com');
			urisDictionaryToReturnFromStub[regex][match].push('" >');
			const expectedFetchedUris = [urisDictionaryToReturnFromStub[regex][match]];
			const expectedNotFetchedUris = [];

			// Spies, Stubs, Mocks
			this.sinon.stub(basicTransformer, 'createRegexUrisDictionary').returns(urisDictionaryToReturnFromStub);
			this.helpersIsEmptyStub.returns(false);
			this.sinon.stub(basicTransformer, 'isUriBlackListed').returns(false);
			uriIsStub.returns(false);
			this.sinon.stub(basicTransformer, 'isUriAllowedByPolicyChecker').returns(true);

			// Validation
			this.validate(basicTransformer, resource, fetchedUris, notFetchedUris,
				expectedFetchedUris, expectedNotFetchedUris);
		});
		it('should populate notFetchedUris array', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var fetchedUris = [];
			var notFetchedUris = [];

			// Expected values
			var urisDictionaryToReturnFromStub = [];
			var regex = /(\s(?:src|href)\s*=\s*["']?\s*)([^"'>]+)(\s*["']?[^>]*>)/ig;
			urisDictionaryToReturnFromStub[regex] = [];
			var match = ' src="www.exmaple.com" >';
			urisDictionaryToReturnFromStub[regex][match] = [];
			urisDictionaryToReturnFromStub[regex][match].push(' src="');
			urisDictionaryToReturnFromStub[regex][match].push('www.exmaple.com');
			urisDictionaryToReturnFromStub[regex][match].push('" >');
			const expectedFetchedUris = [];
			const expectedNotFetchedUris = [urisDictionaryToReturnFromStub[regex][match]];

			// Spies, Stubs, Mocks
			this.sinon.stub(basicTransformer, 'createRegexUrisDictionary').returns(urisDictionaryToReturnFromStub);
			this.helpersIsEmptyStub.returns(false);
			this.sinon.stub(basicTransformer, 'isUriBlackListed').returns(false);
			uriIsStub.returns(false);
			this.sinon.stub(basicTransformer, 'isUriAllowedByPolicyChecker').returns(false);

			// Validation
			this.validate(basicTransformer, resource, fetchedUris, notFetchedUris,
				expectedFetchedUris, expectedNotFetchedUris);
		});
		it('should fail to populate any of the uris arrays because uri is empty', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var fetchedUris = [];
			var notFetchedUris = [];

			// Expected values
			var urisDictionaryToReturnFromStub = [];
			var regex = /(\s(?:src|href)\s*=\s*["']?\s*)([^"'>]+)(\s*["']?[^>]*>)/ig;
			urisDictionaryToReturnFromStub[regex] = [];
			var match = ' src="" >';
			urisDictionaryToReturnFromStub[regex][match] = [];
			urisDictionaryToReturnFromStub[regex][match].push(' src="');
			urisDictionaryToReturnFromStub[regex][match].push('');
			urisDictionaryToReturnFromStub[regex][match].push('" >');
			const expectedFetchedUris = [];
			const expectedNotFetchedUris = [];

			// Spies, Stubs, Mocks
			this.sinon.stub(basicTransformer, 'createRegexUrisDictionary').returns(urisDictionaryToReturnFromStub);
			this.helpersIsEmptyStub.returns(true);

			// Validation
			this.validate(basicTransformer, resource, fetchedUris, notFetchedUris,
				expectedFetchedUris, expectedNotFetchedUris);
		});
		it('should fail to populate any of the uris arrays because uri is a urn', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var fetchedUris = [];
			var notFetchedUris = [];

			// Expected values
			var urisDictionaryToReturnFromStub = [];
			var regex = /(\s(?:src|href)\s*=\s*["']?\s*)([^"'>]+)(\s*["']?[^>]*>)/ig;
			urisDictionaryToReturnFromStub[regex] = [];
			var match = ' src="www.example.com" >';
			urisDictionaryToReturnFromStub[regex][match] = [];
			urisDictionaryToReturnFromStub[regex][match].push(' src="');
			urisDictionaryToReturnFromStub[regex][match].push('www.example.com');
			urisDictionaryToReturnFromStub[regex][match].push('" >');
			const expectedFetchedUris = [];
			const expectedNotFetchedUris = [];

			// Spies, Stubs, Mocks
			this.sinon.stub(basicTransformer, 'createRegexUrisDictionary').returns(urisDictionaryToReturnFromStub);
			this.helpersIsEmptyStub.returns(false);
			this.sinon.stub(basicTransformer, 'isUriBlackListed').returns(false);
			uriIsStub.returns(true);

			// Validation
			this.validate(basicTransformer, resource, fetchedUris, notFetchedUris,
				expectedFetchedUris, expectedNotFetchedUris);
		});
		it('should fail to populate any of the uris arrays because isUriAllowedByPolicyChecker() throws', function() {
			// Object set-up
			this.sinon.stub(Crawler, 'init');
			var basicTransformer = new BasicTransformer(new Crawler({}), {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var fetchedUris = [];
			var notFetchedUris = [];

			// Expected values
			var urisDictionaryToReturnFromStub = [];
			var regex = /(\s(?:src|href)\s*=\s*["']?\s*)([^"'>]+)(\s*["']?[^>]*>)/ig;
			urisDictionaryToReturnFromStub[regex] = [];
			var match = ' src="www.example.com" >';
			urisDictionaryToReturnFromStub[regex][match] = [];
			urisDictionaryToReturnFromStub[regex][match].push(' src="');
			urisDictionaryToReturnFromStub[regex][match].push('www.example.com');
			urisDictionaryToReturnFromStub[regex][match].push('" >');
			const expectedFetchedUris = [];
			const expectedNotFetchedUris = [];

			// Expected values to be passed to the 'transformerror` event spy
			const expectedEventResource = resource;
			const expectedEventUri = 'www.example.com';
			const expectedEventError = new Error('oops');

			// Spies, Stubs, Mocks
			this.sinon.stub(basicTransformer, 'createRegexUrisDictionary').returns(urisDictionaryToReturnFromStub);
			this.helpersIsEmptyStub.returns(false);
			this.sinon.stub(basicTransformer, 'isUriBlackListed').returns(false);
			uriIsStub.returns(false);
			this.sinon.stub(basicTransformer, 'isUriAllowedByPolicyChecker').throws(new Error('oops'));

			// Specific validation pre-conditions
			var transformErrorEventSpy = this.sinon.spy();
			basicTransformer.crawler.on('transformerror', transformErrorEventSpy);

			// Validation
			this.validate(basicTransformer, resource, fetchedUris, notFetchedUris,
				expectedFetchedUris, expectedNotFetchedUris);

			// Specific validation
			sinon.assert.calledOnce(transformErrorEventSpy);
			sinon.assert.calledWithExactly(transformErrorEventSpy, expectedEventResource, expectedEventUri, expectedEventError);
		});
	});
	describe('#createRegexUrisDictionary()', function() {
		before(function () {
			this.validate = function (basicTransformer, resource, regex,
			                          expectedRegexUrisDictionary) {
				basicTransformer.createRegexUrisDictionary(resource, regex);

				sinon.assert.calledOnce(BasicTransformer.prototype.createRegexUrisDictionary);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.createRegexUrisDictionary, resource, regex);
				BasicTransformer.prototype.createRegexUrisDictionary.returned(expectedRegexUrisDictionary);
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'createRegexUrisDictionary');
		});
		it('should create regex uris dictionary successfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			resource.content = " src='www.exmaple.com' />";
			var regex =/(\s(?:src|href)\s*=\s*["']?\s*)([^"'>]+)(\s*["']?[^>]*>)/ig;

			// Expected return value by canTransform()
			var expectedRegexUrisDictionary = [];
			expectedRegexUrisDictionary[regex] = [];
			expectedRegexUrisDictionary[regex].push(' src=\'');
			expectedRegexUrisDictionary[regex].push('www.exmaple.com');
			expectedRegexUrisDictionary[regex].push('\' />');

			// Validation
			this.validate(basicTransformer, resource, regex,
				expectedRegexUrisDictionary);
		});
	});
	describe('#isUriBlackListed()', function() {
		before(function () {
			this.validate = function (basicTransformer, uri, expectedReturnValue) {
				basicTransformer.isUriBlackListed(uri);

				sinon.assert.calledOnce(BasicTransformer.prototype.isUriBlackListed);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.isUriBlackListed, uri);
				BasicTransformer.prototype.isUriBlackListed.returned(expectedReturnValue);
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'isUriBlackListed');
		});
		it('should check if a uri is black listed or not sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var uri = "http://www.example.com";

			// Expected return value by canTransform()
			const expectedReturnValue = false;

			// Validation
			this.validate(basicTransformer, uri, expectedReturnValue);
		});
	});
	describe('#isUriAllowedByPolicyChecker()', function() {
		before(function () {
			this.validate = function (basicTransformer, resource, uriObj,
			                          expectedReturnValue) {
				basicTransformer.isUriAllowedByPolicyChecker(resource, uriObj);

				sinon.assert.calledOnce(BasicTransformer.prototype.isUriAllowedByPolicyChecker);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.isUriAllowedByPolicyChecker, resource, uriObj);
				BasicTransformer.prototype.isUriAllowedByPolicyChecker.returned(expectedReturnValue);
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'isUriAllowedByPolicyChecker');
			this.helpersNormalizeUriStub = this.sinon.stub(helpers, 'normalizeUri');
		});
		it('should check if a resource is allowed by the polocy checker or not sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('http://www.example.com', null);
			var uriObj = new URI('http://www.example.com');

			// Expected return value by canTransform()
			const expectedReturnValue = true;

			// Spies, Stubs, Mocks
			this.helpersNormalizeUriStub.returns(new URI('http://example.com'));
			this.sinon.stub(PolicyChecker.prototype, 'isProtocolAllowed').returns(true);
			this.sinon.stub(PolicyChecker.prototype, 'isFileTypeAllowed').returns(true);
			this.sinon.stub(PolicyChecker.prototype, 'isHostnameAllowed').returns(true);
			this.sinon.stub(PolicyChecker.prototype, 'isLinkAllowed').returns(true);

			// Validation
			this.validate(basicTransformer, resource, uriObj,
				expectedReturnValue);
		});
	});
	describe('#replaceResourceContent()', function() {
		before(function () {
			this.validate = function (basicTransformer, resource, matches, regex, replaceCalculationFunction,
			                          expectedResourceContent) {
				var matchesToCallWith = matches[regex][resource.content];
				basicTransformer.replaceResourceContent(resource, matchesToCallWith, replaceCalculationFunction);

				sinon.assert.calledOnce(BasicTransformer.prototype.replaceResourceContent);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.replaceResourceContent, resource, matchesToCallWith, replaceCalculationFunction);
				if (expectedResourceContent) {
					resource.content.should.be.equal(expectedResourceContent);
				}
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'replaceResourceContent');
			this.helpersCustomEscapeStringRegexp = this.sinon.stub(helpers, 'customEscapeStringRegexp');
			this.helpersHtmlUriDecodeStub = this.sinon.stub(helpers, 'htmlUriDecode');
		});
		it('should replace resource content sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			resource.content = " src='http://www.exmaple.com' />";
			var matches = [];
			var regex = /(\s(?:src|href)\s*=\s*["']?\s*)([^"'>]+)(\s*["']?[^>]*>)/ig;
			matches[regex] = [];
			matches[regex][resource.content] = [];
			matches[regex][resource.content].push([' src=\'', 'http://www.exmaple.com', '\' />']);
			var replaceCalculationFunction = this.sinon.stub();

			// Expected value for resource content
			const expectedResourceContent = " src='../exmaple.com/index.html' />";

			// Spies, Stubs, Mocks
			this.helpersCustomEscapeStringRegexp.onFirstCall().returns('http:\\/\\/www.exmaple.com');
			this.helpersCustomEscapeStringRegexp.onSecondCall().returns(' src=\'');
			this.helpersCustomEscapeStringRegexp.onThirdCall().returns('\' \\/>');
			this.helpersHtmlUriDecodeStub.returns('../exmaple.com/index.html');

			// Validation
			this.validate(basicTransformer, resource, matches, regex, replaceCalculationFunction,
				expectedResourceContent);
		});
		it('should fail to replace resource content because String.prototype.replace() throws an error', function() {
			// Object set-up
			this.sinon.stub(Crawler, 'init');
			var basicTransformer = new BasicTransformer(new Crawler({}), {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			resource.content = " src='http://www.exmaple.com' />";
			var matches = [];
			var regex = /(\s(?:src|href)\s*=\s*["']?\s*)([^"'>]+)(\s*["']?[^>]*>)/ig;
			matches[regex] = [];
			matches[regex][resource.content] = [];
			matches[regex][resource.content].push([' src=\'', 'http://www.exmaple.com', '\' />']);
			var replaceCalculationFunction = this.sinon.stub();

			// Expected values to be passed to the 'transformerror` event spy
			const expectedEventResource = resource;
			const expectedEventUri = 'http:\\/\\/www.exmaple.com';
			const expectedEventError = new Error('oops');

			// Spies, Stubs. Mocks
			this.helpersCustomEscapeStringRegexp.onFirstCall().returns('http:\\/\\/www.exmaple.com');
			this.helpersCustomEscapeStringRegexp.onSecondCall().returns(' src=\'');
			this.helpersCustomEscapeStringRegexp.onThirdCall().returns('\' \\/>');
			this.helpersHtmlUriDecodeStub.returns('../exmaple.com/index.html');
			var stringReplaceStub = this.sinon.stub(String.prototype, "replace");
			stringReplaceStub.onFirstCall().throws(new Error('oops'));

			// Specific validation pre-conditions
			var transformErrorEventSpy = this.sinon.spy();
			basicTransformer.crawler.on('transformerror', transformErrorEventSpy);

			// Validation
			this.validate(basicTransformer, resource, matches, regex, replaceCalculationFunction);

			// Specific validation
			sinon.assert.calledOnce(transformErrorEventSpy);
			sinon.assert.calledWith(transformErrorEventSpy, expectedEventResource, expectedEventUri, expectedEventError);
		});
		it('should fail to replace resource content because uri and replace strings are equal', function() {
			// Object set-up
			this.sinon.stub(Crawler, 'init');
			var basicTransformer = new BasicTransformer(new Crawler({}), {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			resource.content = ' http://www.exmaple.com ';
			var matches = [];
			var regex = /(.{1,20})((?:(?:https?):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|\[(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?:(?::[\da-f]{1,4}){1,6})|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:ffff(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d).){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d).){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))\]|localhost|(?:xn--[a-z\d\-]{1,59}|(?:(?:[a-z\u00a1-\uffff\d]+(?:-[a-z\u00a1-\uffff\d]){0,62})))(?:\.(?:xn--[a-z\d\-]{1,59}|(?:[a-z\u00a1-\uffff\d]+(?:-[a-z\u00a1-\uffff\d]){0,62})))*(?:\.(?:xn--[a-z\d\-]{1,59}|(?:[a-z\u00a1-\uffff]{2,63}))))(?::\d{2,5})?(?:\/[^"'()<>\s]*)?)(.{1,20})/ig;
			matches[regex] = [];
			matches[regex][resource.content] = [];
			matches[regex][resource.content].push([' ', 'http://www.exmaple.com', ' ']);
			var replaceCalculationFunction = this.sinon.stub();

			// Expected value for resource content
			const expectedResourceContent = ' http://www.exmaple.com ';

			// Spies, Stubs. Mocks
			this.helpersCustomEscapeStringRegexp.onFirstCall().returns('http:\\/\\/www.exmaple.com');
			this.helpersCustomEscapeStringRegexp.onSecondCall().returns(' ');
			this.helpersCustomEscapeStringRegexp.onThirdCall().returns(' ');
			this.helpersHtmlUriDecodeStub.returns('http:\\/\\/www.exmaple.com');
			this.sinon.stub(util, 'format').onSecondCall().returns('http:\\/\\/www.exmaple.com');

			// Validation
			this.validate(basicTransformer, resource, matches, regex, replaceCalculationFunction,
				expectedResourceContent);
		});
	});
	describe('#calculateReplacePortionOfFetchedUris()', function() {
		before(function () {
			this.validate = function (basicTransformer, resource, uri,
			                          expectedCalculatedPath) {
				basicTransformer.calculateReplacePortionOfFetchedUris(resource, uri);

				sinon.assert.calledOnce(BasicTransformer.prototype.calculateReplacePortionOfFetchedUris);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.calculateReplacePortionOfFetchedUris, resource, uri);
				BasicTransformer.prototype.calculateReplacePortionOfFetchedUris.returned(expectedCalculatedPath);
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'calculateReplacePortionOfFetchedUris');
			this.helpersNormalizeUriStub = this.sinon.stub(helpers, 'normalizeUri');
		});
		it('should calculate replace portion of a fetched uri with value of / sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var uri = '/';

			// Expected return value by canTransform()
			const expectedCalculatedPath = 'index.html';

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedCalculatedPath);
		});
		it('should calculate replace portion of a fetched uri from different domain and not inside a resource with directory in its url sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var uri = 'http://www.example.com';

			// Expected return value by canTransform()
			const expectedCalculatedPath = '../www.example.com/index.html';

			// Spies, Stubs. Mocks
			this.helpersNormalizeUriStub.returns(new URI('http://www.example.com'));

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedCalculatedPath);
		});
		it('should calculate replace portion of a fetched uri from different domain and inside a resource with an empty directory name in its url sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com/dir1/file.txt', null);
			var uri = 'http://www.example.com';

			// Expected return value by canTransform()
			const expectedCalculatedPath = '../../www.example.com/index.html';

			// Spies, Stubs. Mocks
			this.helpersNormalizeUriStub.returns(new URI('http://www.example.com'));
			this.sinon.stub(util, 'format').returns('');

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedCalculatedPath);
		});
		it('should calculate replace portion of a fetched uri from different domain and inside a resource with directory in its url sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com/dir1/file.txt', null);
			var uri = 'http://www.example.com';

			// Expected return value by canTransform()
			const expectedCalculatedPath = '../../www.example.com/index.html';

			// Spies, Stubs. Mocks
			this.helpersNormalizeUriStub.returns(new URI('http://www.example.com'));

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedCalculatedPath);
		});
		it('should calculate replace portion of a fetched uri from the same domain and not inside a resource with directory in its url sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com', null);
			var uri = 'http://www.google.com/dir1/file.txt';

			// Expected return value by canTransform()
			const expectedCalculatedPath = './dir1/file.txt';

			// Spies, Stubs. Mocks
			this.helpersNormalizeUriStub.returns(new URI('http://www.google.com/dir1/file.txt'));

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedCalculatedPath);
		});
		it('should calculate replace portion of a fetched uri from the same domain and inside a resource with directory in its url sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com/dir2/home.html', null);
			var uri = 'http://www.google.com/dir1/file.txt';

			// Expected return value by canTransform()
			const expectedCalculatedPath = '../dir1/file.txt';

			// Spies, Stubs. Mocks
			this.helpersNormalizeUriStub.returns(new URI('http://www.google.com/dir1/file.txt'));

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedCalculatedPath);
		});
		it('should calculate replace portion of a fetched uri from the same domain and inside a resource with the same nested directory in its url sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com/dir1/dir2/home.html', null);
			var uri = 'http://www.google.com/dir1/file.txt';

			// Expected return value by canTransform()
			const expectedCalculatedPath = '../file.txt';

			// Spies, Stubs. Mocks
			this.helpersNormalizeUriStub.returns(new URI('http://www.google.com/dir1/file.txt'));

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedCalculatedPath);
		});
		it('should calculate replace portion of a fetched uri from the same domain and inside a resource with the same directory in its url sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('https://www.google.com/dir1/home.html', null);
			var uri = 'http://www.google.com/dir1/file.txt';

			// Expected return value by canTransform()
			const expectedCalculatedPath = './file.txt';

			// Spies, Stubs. Mocks
			this.helpersNormalizeUriStub.returns(new URI('http://www.google.com/dir1/file.txt'));

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedCalculatedPath);
		});
	});
	describe('#calculateReplacePortionOfNotFetchedUris()', function() {
		before(function () {
			this.validate = function (basicTransformer, resource, uri,
			                          expectedUri) {
				basicTransformer.calculateReplacePortionOfNotFetchedUris(resource, uri);

				sinon.assert.calledOnce(BasicTransformer.prototype.calculateReplacePortionOfNotFetchedUris);
				sinon.assert.calledWithExactly(BasicTransformer.prototype.calculateReplacePortionOfNotFetchedUris, resource, uri);
				BasicTransformer.prototype.calculateReplacePortionOfNotFetchedUris.returned(expectedUri);
			};
		});
		beforeEach(function () {
			this.sinon.spy(BasicTransformer.prototype, 'calculateReplacePortionOfNotFetchedUris');
		});
		it('should check if a resource is allowed by the polocy checker or not sucessfully', function() {
			// Object set-up
			var basicTransformer = new BasicTransformer({}, {});

			// Input arguments
			var resource = Resource.instance('http://www.example.com', null);
			var uri = 'http://www.example.com';

			// Expected return value by canTransform()
			const expectedUri = new URI('http://www.example.com');

			// Validation
			this.validate(basicTransformer, resource, uri,
				expectedUri);
		});
	});
});