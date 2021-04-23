import { Hello, HelloService } from '@/services/hello'

export default async function handler(req, res) {
    const sv = new HelloService({headers:req.headers})
    const a : Hello = await sv.getHello("Aidan")
    if (req.user == null) {
        return res.status(401).json({error: 'unauthorized'})
    }
    return res.json({hello: a, user: req.user})
}
