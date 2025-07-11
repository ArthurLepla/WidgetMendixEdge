import { join } from "path";
import url from '@rollup/plugin-url';

export default args => {
    const result = args.configDefaultConfig;
    
    if (!result.plugins) {
        result.plugins = [];
    }
    
    result.plugins.push(
        url({
            include: ['**/*.ttf', '**/*.otf'],
            limit: 0,
            fileName: '[name][extname]'
        })
    );
    
    return result;
}; 