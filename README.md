# s3-migrator
Migrate s3 objects to another account


## Install

    git clone https://github.com/kosinix/s3-migrator.git

    cd s3-migrator

    npm install


## Use

Replace xx with actual values:

    # Linux
    AWS_ACCESS_KEY_ID=xx AWS_SECRET_ACCESS_KEY=xx AWS_ACCESS_KEY_ID2=xx AWS_SECRET_ACCESS_KEY2=xx BUCKET1=xx PREFIX1=xx MAX_KEYS=2 BUCKET2=xx node migrate.js

    # Windows
    set AWS_ACCESS_KEY_ID=xx&& set AWS_SECRET_ACCESS_KEY=xx&& set AWS_ACCESS_KEY_ID2=xx&& set AWS_SECRET_ACCESS_KEY2=xx&& set BUCKET1=xx&& set PREFIX1=xx&& set MAX_KEYS=2&& set BUCKET2=xx&& node migrate.js