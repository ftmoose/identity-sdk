const DbManager = {};

Object.defineProperty(DbManager, 'dbOptions', {
  value: {
    ok: true,
  },
});

console.log(DbManager.dbOptions);
DbManager.dbOptions.h = false;
console.log(DbManager.dbOptions);
