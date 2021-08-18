// import { Injectable } from "@nestjs/common";
import { BasicAuthSecurity, Client, createClientAsync } from 'soap';
import { BCeIDConfig } from './config';
// import { LoggerService } from "../../logger/logger.service";
import { ConfigService } from '../config.service';
import { AccountDetails } from './account-details.model';
import {
  BCeIDAccountTypeCodes,
  ResponseBase,
  ResponseCodes,
} from './bceid.models';

import { Logger } from '../../logger';

/**
 * Manage the execution of SOAP requests to the BCeID Web Service as per described
 * on https://sminfo.gov.bc.ca/ based on the documentation available on
 * "BCeID Client - New Web Services - Developers Guide - V2.10.0 (for BCeID WS V10).docx"
 */
// @Injectable()
export class BCeIDService {
  private bceidConfig: BCeIDConfig;
  constructor(private readonly config: ConfigService) {
    this.bceidConfig = this.config.getConfig().bceid;
  }

  /**
   * This method allows you to retrieve the details of a single BCeID account.
   * This method respects the information sharing rules. To perform a query, there must be an
   * information sharing rule for the online service (onlineServiceId) with the specified requester
   * user account type (requesterAccountTypeCode) and target user account type (accountTypeCode).
   * The information returned by a query is restricted to the properties included in the information sharing rules.
   * @param userName User name associated with the account whose details are being queried.
   * @returns account details if the account was found, otherwise null.
   */
  public async getAccountDetails(userName: string): Promise<AccountDetails> {
    var client = await this.getSoapClient();
    // SOAP call body to execute the getAccountDetail request.
    var body = {
      accountDetailRequest: {
        onlineServiceId: this.bceidConfig.onlineServiceId,
        // Internal indicate that the user being provided
        // on requesterUserGuid is an user that belongs
        // to the internal gov network.
        requesterAccountTypeCode: BCeIDAccountTypeCodes.Internal,
        // The user guid of the user on the internal gov network.
        requesterUserGuid: this.bceidConfig.requesterUserGuid,
        userId: userName,
        // Type of the user account to search for the userId
        // parameter provided above. Only business BCeID are
        // on the scope of the application.
        accountTypeCode: BCeIDAccountTypeCodes.Business,
      },
    };

    this.logger.info('Calling with %j', body);
    try {
      // Destructuring the result of the SOAP request to get the
      // first item on the array where the parsed js object is.
      const [result] = await client.getAccountDetailAsync(body);
      const response = result.getAccountDetailResult as ResponseBase;

      if (ResponseBase.hasNoResults(response)) {
        return null;
      }

      this.ensureSuccessStatusResult(response);

      const userAccount = result.getAccountDetailResult.account;
      this.logger.info('Result = %j', userAccount);
      return {
        user: {
          guid: userAccount.guid.value,
          displayName: userAccount.displayName.value,
          firstname: userAccount.individualIdentity?.name?.firstname.value,
          surname: userAccount.individualIdentity?.name?.surname.value,
          email: userAccount.contact?.email.value,
          isSuspended: userAccount.state.isSuspended.value,
          isManagerDisabled: userAccount.state.isManagerDisabled.value,
        },
        institution: {
          guid: userAccount.business?.guid.value,
          type: userAccount.business?.type.code,
          legalName: userAccount.business?.legalName.value,
          businessTypeOther: userAccount.business?.businessTypeOther.value,
          isSuspended: userAccount.business?.state.isSuspended.value,
          address: {
            addressLine1: userAccount.business?.address?.addressLine1.value,
            addressLine2: userAccount.business?.address?.addressLine2.value,
            city: userAccount.business?.address?.city.value,
            postal: userAccount.business?.address?.postal.value,
            province: userAccount.business?.address?.province.value,
            country: userAccount.business?.address?.country.value,
          },
        },
      };
    } catch (error) {
      this.logger.error(
        `Error while retrieving account details from BCeID Web Service. ${error}`
      );
      throw error;
    }
  }

  /**
   * Creates a SOAP Client ready to execute the authenticated SOAP requests.
   * @returns Configured SOAP client.
   */
  private async getSoapClient(): Promise<Client> {
    // Authentication header to retrieve the WSDL necessary to initialize the SOAP Client.
    const wsdlAuthHeader = this.getWsdlAuthHeader();
    // Authentication needed to execute each SOAP action request.
    const clientSecurity = new BasicAuthSecurity(
      this.bceidConfig.credential.userName,
      this.bceidConfig.credential.password
    );
    this.logger.info(
      'Soap Client User %s',
      this.bceidConfig.credential.userName
    );
    try {
      var client = await createClientAsync(this.bceidConfig.wsdlEndpoint, {
        wsdl_headers: wsdlAuthHeader,
      });
      client.setSecurity(clientSecurity);
      return client;
    } catch (error) {
      this.logger.error(
        `Error while creating BCeID Web Service client. ${error}`
      );
      throw error;
    }
  }

  /**
   * Ensures that the method was successfully executed and
   * returned with the expected Success code.
   * @param methodCallResult Specific result object from response.
   * For instance, for accountDetailRequest it would be inner object
   * getAccountDetailResult from the getAccountDetailResponse.
   */
  private ensureSuccessStatusResult(methodCallResult: ResponseBase) {
    if (methodCallResult.code !== ResponseCodes.Success) {
      this.logger.error(
        `Method returned an unsuccessful status.
         Code: ${methodCallResult.code},
         failureCode: ${methodCallResult.failureCode},
         message: ${methodCallResult.message}`
      );
      throw new Error(
        'Unexpected result while executing request to BCeID Web Service.'
      );
    }
  }

  /**
   * Gets WSDL authentication header needed to retrieve the WSDL from BCeID Web Service.
   * @returns Authorization header converted to base64 string.
   */
  private getWsdlAuthHeader() {
    const auth =
      'Basic ' +
      Buffer.from(
        `${this.bceidConfig.credential.userName}:${this.bceidConfig.credential.password}`
      ).toString('base64');
    return { Authorization: auth };
  }

  logger = Logger('bceid.service');
}
