    import Model from 'can/model/';
    import RinsCommon from 'utils/urls';

    var MassFileUpLoader = Model.extend({

        create: function(params) {
            return $.ajax({
                url:RinsCommon.DOMAIN_SERVICE_URL+'invoice/attachFiles',
                contentType:'application/json; charset=utf-8',
                datatype:'json',
                type: 'POST',
                data: JSON.stringify(params)
            });

        }
    },{});
    export default MassFileUpLoader;