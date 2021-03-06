module.exports = app => {
  const _ = require("underscore");
  const Usuario = require("../models/usuariosSchema");
  const Save = require("../models/SaveSchema");
  const Chart = require("../models/chartsSchema");
  const Type = require("../models/typechartSchema");
  var uniquevalidate = require("mongoose-unique-validator");

  // service of select all users

  app.get("/usuario", function(req, res) {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limit = req.query.limit || 100;
    limit = Number(limit);

    Usuario.find(
      {},
      "nombre email google estado img role nivel mes charts anio  poblacion "
    )
      .skip(desde)
      .limit(limit)
      .exec((err, usuario) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err
          });
        }

        Usuario.collection.countDocuments({}, (err, conteo) => {
          res.json({
            ok: true,
            usuario,
            cuantos: conteo
          });
        });
      });
  });

  // app.post("/Usuario_post", function (req, res) {
  //   let body = req.body;
  //   let usuario = new Usuario({
  //     nombre: body.nombre,
  //     email: body.email,
  //     nivel: body.nivel,
  //     mes: body.mes,
  //     charts: body.charts,
  //     anio: body.anio,
  //     poblacion: body.poblacion,
  //     password: bcrypt.hashSync(body.password, 10),
  //     role: body.role
  //   });
  //   usuario.save((err, usuarioDB) => {
  //     if (err) {

  //       return res.status(400).json({
  //         ok: false,
  //         err
  //       });
  //     }

  //     res.json({
  //       ok: true,
  //       usuario: usuarioDB
  //     });
  //   });

  // });

  app.put("/Usuario/:id", function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ["nombre", "email", "role", "estado"]);

    Usuario.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true
      },
      (err, usuarioDB) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err
          });
        }
        res.json({
          ok: true,
          usuario: usuarioDB
        });
      }
    );
  });

  app.delete("/delete/:id", function(req, res) {
    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioDelete) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        usuario: usuarioDelete
      });
    });
  });

  //  TABLA DE GRAFICA CHARTS
  app.post("/charts_post", function(req, res) {
    // guardo los nuevos valores   del chart
    let body = req.body;
    let chart = new Chart({
      level: body.level,
      value: body.value,
      name: body.name
    });
    chart.save((err, chartDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        chart: chartDB
      });
    });
  });

  app.get("/Getchar", function(req, res) {
    //muestra los  nuevos datos ingresados
    var nombre = req.query.nombre;
    Chart.find(
      {
        name: nombre
      },
      " level value name  "
    ).exec((err, chart) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      Chart.collection.countDocuments({}, (err, conteo) => {
        res.json({
          ok: true,
          chart,
          cuantos: conteo
        });
      });
    });
  });
  //  actualiza los datos del chart
  app.post("/ChartdataUpdate", function(req, res) {
    var myquery = {
      _id: req.body._id
    };
    var newvalues = {
      $set: {
        name: req.body.name,
        level: req.body.level,
        value: req.body.value
      }
    };
    Chart.updateOne(
      myquery,
      newvalues,
      {
        new: true,
        runValidators: true,
        unsert: true
      },
      (err, saveDB) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err
          });
        }
        res.json({
          ok: true,
          Chart: saveDB
        });
      }
    );
  });

  app.post("/DeletedataChart", function(req, res) {
    var myquery = {
      _id: req.body._id,
      name: req.body.name,
      level: req.body.level,
      value: req.body.value
    };
    Chart.deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      res.json({
        ok: true,
        obj
      });
    });
  });

  app.get("/Name", function(req, res) {
    //  regresa el  nombre del tipo de data (censo o lluvia )
    Chart.find({});
    Chart.distinct("name").exec((err, chart) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      Chart.collection.countDocuments({}, (err, conteo) => {
        res.json({
          ok: true,
          chart,
          cuantos: conteo
        });
      });
    });
  });

  app.post("/Save_post", function(req, res) {
    let body = req.body;
    let save = new Save({
      name: body.name,
      type: body.type,
      data: body.data
    });
    save.save((err, saveDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        save: saveDB
      });
    });
  });

  app.get("/getChartListData", function(req, res) {
    //regresa los datos guardados del chart
    Save.find({}, "  name type data").exec((err, chartList) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      Save.collection.countDocuments({}, (err, conteo) => {
        res.json({
          ok: true,
          chartList,
          cuantos: conteo
        });
      });
    });
  });

  app.post("/ChartUpdate", function(req, res) {
    //  actualiza el chart con los
    var myquery = {
      name: req.body.name
    };
    var newvalues = {
      $set: {
        name: req.body.name,
        type: req.body.type,
        data: req.body.data
      }
    };
    Save.updateOne(
      myquery,
      newvalues,
      {
        new: true,
        runValidators: true,
        unsert: true
      },
      (err, saveDB) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err
          });
        }
        res.json({
          ok: true,
          save: saveDB
        });
      }
    );
  });

  app.post("/DeleteChart/:name", function(req, res) {
    var myquery = {
      name: req.body.name
    };
    Save.deleteOne(myquery, function(err, db) {
      if (err) throw err;
      res.json({
        ok: true,
        db
      });
    });
  });

  app.get("/getTypeChart", function(req, res) {
    // tipo de chart ( line etc )
    Type.distinct("type").exec((err, CharType) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        CharType
      });
    });
  });

  app.post("/post_TypeChart", function(req, res) {
    let body = req.body;
    let type = new Type({
      type: body.type
    });
    type.save((err, typesaveDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        Type: typesaveDB
      });
    });
  });

  // update name chart

  app.get("/ValidName/", function(req, res) {
    // req.query.name
    Save.find(
      {
        name: req.query.name
      },
      "name"
    ).exec((err, data) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        data: data
      });
    });
  });
  app.post("/CreateNewChart", function(req, res) {
    //  actualiza el chart con
    let body = req.body;
    let save = new Save({
      name: body.name,
      type: body.type,
      data: body.data
    });
    save.save((err, saveDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        save: saveDB
      });
    });
  });
  app.post("/ChartSave", function(req, res) {
    //  actualiza el chart con los
    let body = req.body;
    var myquery = {
      _id: body._id
    };
    var newvalues = {
      $set: {
        _id: body._id,
        name: body.name,
        type: body.type,
        data: body.data
      }
    };
    Save.updateOne(myquery, newvalues, {}, (err, saveDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        save: saveDB
      });
    });
  });
};
