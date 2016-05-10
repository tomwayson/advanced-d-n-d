import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'div',
  classNames: ['drop-target'],
  attributeBindings:['style'],

  style:Ember.computed('model', function(){
    let pos = this.get('model');
    if(pos){
      return Ember.String.htmlSafe('top:' + pos.top + 'px; height:' + pos.height + 'px;left:' + pos.left + 'px;width:' + pos.width + 'px;');
    }else{
      return Ember.String.htmlSafe('');
    }
  }),
});
