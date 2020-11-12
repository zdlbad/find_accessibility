// only leave fileds in includedFields
exports.include = (obj, ...includedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (includedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// remove fileds in excludedFields
exports.exclude = (obj, ...excludedFields) => {
  const newObj = { ...obj };
  Object.keys(obj).forEach((el) => {
    if (excludedFields.includes(el)) newObj[el] = undefined;
  });
  return newObj;
};

exports.reverseFilter = (obj, ...excludedFields) => {
  const newObj = { ...obj };
  Object.keys(obj).forEach((el) => {
    if (excludedFields.includes(el)) {
      const temp = obj[el];
      newObj[el] = { ne: !temp };
    }
  });
  return newObj;
};
