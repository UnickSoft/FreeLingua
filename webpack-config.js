module.exports = {
    devtool: 'source-map',
    entry: {
        meta_app: "./frontend/meta_app.tsx",
        classroom: "./frontend/classroom_app.tsx",
        office: "./frontend/office_app.tsx",
        admin: "./frontend/admin_app.tsx"
        },
    mode: "production", // "development", // 
    output: {
        filename: "./js/[name].app-bundle.js"
    },
    resolve: {
        extensions: ['.Webpack.js', '.web.js', '.ts', '.js', '.jsx', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.tsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'ts-loader'
                }
            }
        ]
    }
}