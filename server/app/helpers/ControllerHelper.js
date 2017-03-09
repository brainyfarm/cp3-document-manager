import reply from './../helpers/ResponseSender';

const cleanSearchTerm = term =>
  term.replace(/[^a-z0-9]/gi, '');

const idIsBad = givenId =>
  /[^0-9]/.test(givenId);

const getPageQueries = (req) => {
  const pageTest = req.query.page || 1;
  const limitTest = req.query.limit || 1;
  const offsetTest = req.query.offset || 1;
  const allData = `${pageTest}${limitTest}${offsetTest}`;
  return allData;
};

const isBadPageQuery = pageQuery =>
  /[^0-9]/.test(pageQuery);

const getPageData = (req) => {
  const page = req.query.page || null;
  const limit = req.query.limit || 100;
  let offset = req.query.offset || 0;
  offset = page ? limit * (page - 1) : offset;
  const order = '"id"';
  return {
    limit, offset, order
  };
};

const getPageMetaData = (req, result, offset, limit) => {
  const numberOfPages = Math.ceil(result.count / limit);
  const currentPage = offset > 0 ?
    result.currentPage = Math.floor(offset / limit) + 1 :
    req.query.page || 1;
  return {
    numberOfPages,
    currentPage
  };
};

export {
  cleanSearchTerm,
  idIsBad,
  getPageData,
  getPageMetaData,
  getPageQueries,
  isBadPageQuery
};
