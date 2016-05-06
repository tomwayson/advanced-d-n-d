import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('copy');
  this.route('neighbors');
  this.route('rows');
});

export default Router;
