import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['resizer'],
  attributeBindings:['style'],
  style:Ember.computed('model.position', function(){
    let pos = this.get('model.position');
    if(pos){
        return 'top:' + pos.top + '; bottom:' + pos.bottom + ';left:' + pos.left + ';hight:' + pos.height;
    }else{
      return '';
    }

  })
});
