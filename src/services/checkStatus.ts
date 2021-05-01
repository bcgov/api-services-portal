import { logger } from '../logger'

import { IssuerMisconfigError } from './issuerMisconfigError'

export function checkStatus(res: any) {
    if (res.ok) {
        return res;
    } else {
        const error = { reason: 'unknown_error', status: `${res.status} ${res.statusText}` }
        logger.error("Error - %d %s", res.status, res.statusText)
        res.text().then((t : string ) => {
            logger.error("ERROR " + t)
            try {
                const errors = JSON.parse(t)
                error['reason'] = errors['error']
            } catch (e) {
                logger.error("Not able to parse error response (%s)", e)
            }
        })
        throw new IssuerMisconfigError(error);
    }
}
