var express = require('express');
var router = express.Router();
var db = require('../models/db');
var helper = require('./tablehelper');
const tableNames = initTableNames();

router.get('/:table', function(req, res, next) {
  const tableColumns = helper.getTableHeaders(req.params.table);

  // check for valid table
  if (tableColumns) {
    console.log('**** here ****')
    console.log(tableNames[req.params.table])
    helper.getDbObject(req.params.table).findAndCount({
      attributes: tableColumns,
      raw: true,
      limit: 10,
    }).then(function(results) {
      res.render('table', {
        table_name: tableNames[req.params.table],
        table_abrv: req.params.table,
        table_header: tableColumns,
        table_data: results.rows
      });
    });
  }
  else {
    req.stuts(404).send();
    res.render('error');
  }
});

function initTableNames() {
  let names = {};
  names["buckets"] = "Buckets";
  names["compType"] = "Comp Type";
  names["comphistory"] = "Component History";
  names["components"] = "Components"
  names["componentUsage"] = "Component Usage";
  names["empSalary"] = "Emp Salary";
  names["fixedAssyUse"] = "Fixed Assy Use";
  names["mix"] = "Mix";
  names["mixRegistry"] = "Mix Registry";
  names["modelCostData"] = "Model Cost Data";
  names["personnel"] = "Personnel";
  names["prodGrp"] = "Prod Grp";
  names["productsColorCostJg"] = "Products Color Cost Jg";
  names["prodhistory"] = "Product History";
  names["products"] = "Products";
  names["status"] = "Status";
  names["unitType"] = "Unit Type";
  names["units"] = "Units";
  return names;
}

module.exports = router;
