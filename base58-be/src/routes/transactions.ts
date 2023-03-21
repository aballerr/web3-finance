import express from "express";
import _ from "lodash";
import fetch from "node-fetch";
import { createOrFindCompany } from "../services/db/company";
import { TransactionCategory, User, UserFiles } from "../models/db";
import getKnexClient, { getPreloadedClient } from "../services/db/knex";
import { processFilters } from "../services/gnosis";
import { deleteFile, getPresignedUrl, uploadFile } from "../services/s3";
import multiparty from "multiparty";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/categories", async (req, res) => {
  const user = req.user as User;
  const company = await createOrFindCompany(user);
  const knex = await getPreloadedClient();

  try {
    const categories = await knex
      .TRANSACTION_CATEGORIES()
      .where({ companyId: company.id });

    res.send({ categories, success: true });
  } catch (err) {
    res.send({ success: false });
  }
});

router.post("/", async (req, res) => {
  const user = req.user as User;
  const company = await createOrFindCompany(user);
  const knex = await getPreloadedClient();

  const query = await processFilters(req.body, company);

  const transactions = await knex
    .GNOSIS_SAFE_TRANSACTIONS()
    .whereRaw(
      `"gnosisSafeTransactions"."companyId" = ${company.id} ${query} order by "executionDate" desc;`
    );

  for (const transaction of transactions) {
    // @ts-ignore
    transaction.transfers = await knex
      .GNOSIS_SAFE_TRANSACTIONS_TRANSFERS()
      .where({ gnosisSafeTransaction: transaction.id });

    transaction.files = await knex
      .USER_FILES()
      .where({ transactionId: transaction.id, companyId: company.id });
  }

  res.send(transactions);
});

router.delete("/category/:categoryId", async (req, res) => {
  const user = req.user as User;
  const company = await createOrFindCompany(user);
  const knex = await getPreloadedClient();

  const categoryId = parseInt(req.params.categoryId);

  try {
    // I want to make sure the actual category exists
    const category = await knex
      .TRANSACTION_CATEGORIES()
      .where({ companyId: company.id, id: categoryId })
      .first();

    if (category) {
      const transactions = await knex
        .GNOSIS_SAFE_TRANSACTIONS()
        .where({ companyId: company.id, categoryId: categoryId })
        .update({ categoryId: null })
        .returning("*");

      const category = await knex
        .TRANSACTION_CATEGORIES()
        .where({ companyId: company.id, id: categoryId })
        .delete();
      res.send({ success: true });
    } else {
      res.send({ success: false, message: "no category" });
    }
  } catch (err) {
    console.log(err);
    console.log("ERROR: /category/:categoryId failed");
    res.send({ success: false, message: "no category" });
  }
});

router.put("/category", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);
  const newCategory: TransactionCategory = req.body.newCategory;

  try {
    if (newCategory) {
      const updatedCategory = await knex
        .TRANSACTION_CATEGORIES()
        .where({ id: newCategory.id, companyId: company.id })
        .update({
          categoryName: newCategory.categoryName,
          backgroundColor: newCategory.backgroundColor,
          textColor: newCategory.textColor,
        })
        .returning("*");
    }

    res.send({ success: true });
  } catch (err) {
    console.log(err);
    console.log("ERROR /transactions/category");
    res.send({ success: false });
  }
});

router.put("/", async (req, res) => {
  const user = req.user as User;
  const transaction = _.omit(req.body.transaction, [
    "isChecked",
    "transfers",
    "categoryName",
    "textColor",
    "backgroundColor",
    "files",
  ]); // this is used on frontend for exporting, omit this key
  const newCategory: TransactionCategory = req.body.newCategory;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);
  let finalCategory = null;
  let isNew = false;

  try {
    if (newCategory) {
      const exists = await knex
        .TRANSACTION_CATEGORIES()
        .whereRaw(`LOWER("categoryName") = LOWER(?) and "companyId" = ?`, [
          newCategory.categoryName,
          company.id,
        ])
        .first();

      if (exists) {
        transaction.categoryId = exists.id;
        finalCategory = exists;
      } else {
        const category = await knex
          .TRANSACTION_CATEGORIES()
          .insert({
            companyId: company.id,
            categoryName: newCategory.categoryName,
            backgroundColor: newCategory.backgroundColor,
            textColor: newCategory.textColor,
          })
          .returning("*");

        transaction.categoryId = category[0].id;
        finalCategory = category[0];
        isNew = true;
      }
    }

    const oldTransaction = await knex
      .GNOSIS_SAFE_TRANSACTIONS()
      .where({
        txnHash: transaction.txnHash,
      })
      .first();

    if (oldTransaction && transaction) {
      // I forget the exact reason, but likely we lose some data on FE and add it back here
      const final = {
        ...oldTransaction,
        ...transaction,
        companyId: company.id,
      };

      const success = await knex
        .GNOSIS_SAFE_TRANSACTIONS()
        .update(final)
        .where({
          id: oldTransaction.id,
          companyId: company.id,
        })
        .returning("*");

      res.send({ success: true, category: finalCategory, isNew });
    } else {
      res.send({ success: false });
    }
  } catch (err) {
    console.log(err);
    console.log("UPDATE gnosis-safe/transaction failed");

    res.send({ success: false });
  }
});

router.post("/filters", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);
  const filterInfo = req.body;

  try {
    const filter = await knex
      .TRANSACTION_FILTERS()
      .insert({
        companyId: company.id,
        userId: user.id,
        filter: filterInfo.filter,
        filterName: filterInfo.filterName,
        shared: filterInfo.shared,
      })
      .returning("*");

    res.send({ success: true, filter: filter[0] });
  } catch (err) {
    res.send({ success: false });
  }
});

router.put("/filters/:filterId", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);
  const transactionId = parseInt(req.params.filterId);

  try {
    const filters = await knex
      .TRANSACTION_FILTERS()
      .where({
        id: transactionId,
        companyId: company.id,
        userId: user.id,
      })
      .orWhere({
        id: transactionId,
        companyId: company.id,
        shared: true,
      })
      .update({ filter: req.body })
      .returning("*");

    res.send({ success: true });
  } catch (err) {
    res.send({ success: false });
  }
});

router.get("/filters", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);

  const filters = await knex
    .TRANSACTION_FILTERS()
    .where({
      companyId: company.id,
      userId: user.id,
    })
    .orWhere({
      companyId: company.id,
      shared: true,
    });

  res.send({ filters, success: true });
});

router.delete("/filters/:filterId", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);

  try {
    await knex
      .TRANSACTION_FILTERS()
      .where({
        companyId: company.id,
        userId: user.id,
        id: parseInt(req.params.filterId),
      })
      .delete();

    res.send({ success: true });
  } catch (err) {
    res.send({ success: false });
  }
});

router.post("/image/upload", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);

  const form = new multiparty.Form();

  // @ts-ignore
  form.parse(req, async (error, fields, files) => {
    if (error) {
      console.log("parse failed");
      console.log(error);
    } else {
      console.log(files.file[0]);
    }

    const file = files.file[0];
    const finalName = file.originalFilename;
    const extension = path.extname(finalName);
    const { type, transactionId } = fields;

    if (file.size > 10000000) {
      res.status(500).send({ error: "file size exceeds 10mb" });
    }

    if (error) {
      return res.status(500).send(error);
    }
    try {
      const path = files.file[0].path;
      const buffer = fs.readFileSync(path);
      const fileName = `images/${company.id}/${user.id}/${transactionId[0]}/${file.originalFilename}`;
      const data = await uploadFile(buffer, fileName, type[0]);

      const saveMetaData = await knex
        .USER_FILES()
        .insert({
          companyId: company.id,
          fileName: finalName,
          userId: user.id,
          transactionId: transactionId[0],
          key: data.Key,
          bucket: data.Bucket,
        })
        .returning("*");

      return res.status(200).send({ success: true, file: saveMetaData[0] });
    } catch (err) {
      console.log(err);
      console.log("failed");
      return res.status(500).send(err);
    }
  });
});

router.delete("/image", async (req, res) => {
  const user = req.user as User;
  const knex = await getPreloadedClient();
  const company = await createOrFindCompany(user);
  const file: UserFiles = req.body;

  try {
    const fileExists = await knex.USER_FILES().where({
      id: file.id,
      companyId: company.id,
      userId: user.id,
    });

    if (fileExists) {
      await knex
        .USER_FILES()
        .where({
          id: file.id,
          companyId: company.id,
          userId: user.id,
        })
        .delete();

      await deleteFile(file);

      res.status(200).send({ success: true });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    console.log(err);
    res.status(200).send({ success: false });
  }
});

router.post("/image/link", async (req, res) => {
  try {
    const presignedUrl = await getPresignedUrl(req.body);

    return res.send({ success: true, url: presignedUrl });
  } catch (err) {
    console.log(err);
    console.log("/image/download: failed");
    return res.send({ sucess: false });
  }
});

export default router;
