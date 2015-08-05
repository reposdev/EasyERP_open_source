/**
 * Created by Roman on 04.05.2015.
 */

/**
 * Created by Roman on 04.05.2015.
 */

var mongoose = require('mongoose');
var Customers = function (models) {
    var access = require("../Modules/additions/access.js")(models);
    var CustomerSchema = mongoose.Schemas['Customer'];

    var _ = require('../node_modules/underscore');

    this.getSuppliersForDD = function (req, res, next) {
        var query = models.get(req.session.lastDb, 'Customers', CustomerSchema).find();

        query.select('_id name ');
        query.where({'salesPurchases.isSupplier': true});
        query.sort({'name': 1});
        query.exec(function (err, suppliers) {
            if (err) {
                next(err);
            } else {
                res.status(200).send({data: suppliers});
            }
        });
    };

    this.getFilterValues = function (req, res, next) {
        var opportunity = models.get(req.session.lastDb, 'Customers', CustomerSchema);

        opportunity.aggregate([
            {
                $group:{
                    _id: null,
                    name: {
                        $addToSet: {
                            name: '$name.first',
                            _id: '$_id'
                        }
                    },
                    country: {
                        $addToSet: '$address.country'
                    }
                }
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            _.map(result[0], function(value, key) {
                switch (key) {
                    case 'name':
                        result[0][key] = {
                            displayName: 'Name',
                            values: _.sortBy(value, 'name')
                        };
                        break;
                    case  'country':
                        result[0][key] = {
                            displayName: 'Country',
                            values: _.sortBy(value, function (num) { return num})
                        };
                        break;
                }
            });

            result[0]['services'] = {
                displayName: 'Services',
                values: [{displayName: 'Supplier', _id: 'isSupplier'}, {displayName: 'Customer', _id: 'isCustomer'}]
            };

            res.status(200).send(result);
        });
    }
};

module.exports = Customers;