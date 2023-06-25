import { Request, Response } from "express";
import { CreateProductInput, UpdateProductInput } from "../schema/product.schema";
import { createProduct,findProduct,findAndUpdateProduct,deleteProduct } from '../service/product.service'

export async function createProductHandler(req: Request<{},{},CreateProductInput["body"]>, res: Response) {
    
    const userId = res.locals.user._id

    const body = req.body

    const product = await createProduct({...body, user: userId});

    return res.send(product)
}

export async function getProductHandler(req: Request<UpdateProductInput['params']>, res: Response) {
    const productId = req.params.productId;
    const product = await findProduct({productId})

    if(!product){
        return res.sendStatus(404)
    }

    return res.send(product)
}

export async function updateProductHandler(req: Request<UpdateProductInput['params']>, res: Response) {
    const userId = res.locals.user._id
    const productId = req.params.productId
    const update = req.body

    const product = await findProduct({productId})

    if(!product){
        return res.sendStatus(404)
    }

    if(String(product.user) !== userId){
        return res.sendStatus(403)
    }

    const updateProduct = await findAndUpdateProduct({productId},update, {
        new:true,
    })

    return res.send(updateProduct);
}

export async function deleteProductHandler(req: Request<UpdateProductInput['params']>, res: Response) {
    const userId = res.locals.user._id
    const productId = req.params.productId

    const product = await findProduct({productId})

    if(!product){
        return res.sendStatus(404)
    }

    if(String(product.user) !== userId){
        return res.sendStatus(403)
    }

    const updateProduct = await deleteProduct({productId})

    return res.sendStatus(200);
}