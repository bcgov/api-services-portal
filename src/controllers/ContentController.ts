import {
    Body,
    Controller,
    Request,
    Get,
    Put,
    Path,
    Post,
    Query,
    Route,
    Security,
    SuccessResponse,
} from "tsoa";
import express from 'express'
import { NamespaceValidator } from '../auth/namespace-validator'
import { KeystoneService } from "./ioc/keystoneInjector"
import { inject, injectable } from "tsyringe";
import { Content } from "@/services/keystone/types";

const { syncRecords } = require('../batch/feedWorker')

@injectable()
@Route("/namespaces/{ns}/contents")
@Security('jwt', ['Content.Publish'])
export class ContentController extends Controller {
    private keystone: KeystoneService
    constructor (@inject('KeystoneService') private _keystone: KeystoneService) {
        super()
        this.keystone = _keystone
    }

    @Put()
    public async putContent(
        @Path() ns: string,
        @Request() request: express.Request
    ): Promise<any> {
        return await syncRecords(this.keystone.context(), 'Content', request.body['id'], request.body)
    }

    @Get()
    @NamespaceValidator()
    public async getContent(
        @Request() request: any,
        @Path() ns: string
    ): Promise<Content[]> {
        const result = await this.keystone.executeGraphQL({ context: this.keystone.createContext(request), query: "query DiscoverableContent { allDiscoverableContents(where: { isComplete: true}) { id, slug, title, description, tags } }"})
        console.log(JSON.stringify(result, null, 5))
        return result.data.allDiscoverableContents
    }
}
