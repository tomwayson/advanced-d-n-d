import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings:['bootstrapGridClass'],
  bootstrapGridClass:Ember.computed('model.width', function(){
    return 'col-md-' + this.get('model.width');
  }),
});
